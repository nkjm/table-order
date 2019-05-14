"use strict";

const express = require('express');
const router = express.Router();
const debug = require("debug")("bot-express:route");
const restaurante = require("../service/restaurante");
const Pay = require("line-pay");
const line_event = require("../service/line-event");
const LINE_PAY_IS_SANDBOX = (process.env.LINE_PAY_IS_SANDBOX === "false") ? false : true;

/**
 * Payment confirm URL
 */
router.get('/confirm', async (req, res, next) => {
    // !!!! Need to verify if this request is really from LINE Pay

    if (!req.query.transactionId || !req.query.orderId){
        // Required query string not found.
        return res.sendStatus(400);
    }

    // Get reserved info
    debug(`Transaction Id is ${req.query.transactionId}`);
    debug(`Order Id is ${req.query.orderId}`);

    // Format of order_id is {restaurante_id}-{4 digit number} so we can extract restaurante_id from order_id.
    const restaurante_id = req.query.orderId.split("-")[0];

    // Get order from db.
    let order = await restaurante.get_order(restaurante_id, req.query.orderId);

    // Get restaurante detail.
    let r = await restaurante.get(restaurante_id, order.language);

    // Instantiate Pay SDK.
    const pay = new Pay({
        channelId: r.line_pay.channel_id,
        channelSecret: r.line_pay.channel_secret,
        isSandbox: LINE_PAY_IS_SANDBOX
    });

    debug("Going to update order status to 'paid'.");
    try {
        await restaurante.update_order(order.restaurante.id, order.id, {
            paid_at: new Date(),
            status: "paid"
        });
    } catch(e) {
        await apologize(order);
        return res.sendStatus(400);
    }

    // Confirm & Capture the payment.
    debug(`Going to confirm/capture payment of following order..`);
    debug(order);

    try {
        await pay.confirm({
            transactionId: order.transaction_id,
            amount: order.amount,
            currency: order.currency
        });
    } catch(e) {
        // Cancel order
        await restaurante.cancel_order(order.restaurante.id, order.id);

        await apologize(order);
        return res.sendStatus(400);
    }

    debug("Succeeed to confirm/capture payment.");
    res.sendStatus(200);

    debug("Going to send completion message to user.");
    await line_event.fire({
        type: "bot-express:push",
        to: {
            type: "user",
            userId: order.line_user_id
        },
        intent: {
            name: "send-receipt",
            parameters: {
                restaurante_id: order.restaurante.id,
                order_id: order.id
            }
        },
        language: order.language
    });
});

async function apologize(order){
    return line_event.fire({
        type: "bot-express:push",
        to: {
            type: "user",
            userId: order.line_user_id
        },
        intent: {
            name: "robot-response",
            fulfillment: [{
                type: "text",
                text: await t.t("failed_to_capture_payment")
            }]
        },
        language: order.language
    });
}

module.exports = router;
