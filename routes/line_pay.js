"use strict";

const express = require('express');
const router = express.Router();
const debug = require("debug")("bot-express:route");
const Pay = require("line-pay");
const ServiceDb = require("../service/db");
const db = new ServiceDb();
const ServiceCache = require("../service/cache");
const cache = new ServiceCache();
const line_event = require("../service/line_event");

const pay = new Pay({
    channelId: process.env.LINE_PAY_CHANNEL_ID,
    channelSecret: process.env.LINE_PAY_CHANNEL_SECRET,
    isSandbox: (process.env.LINE_PAY_ENV === "sandbox") ? true : false,
    proxyUrl: (process.env.LINE_PAY_ENV === "sandbox") ? null : process.env.FIXIE_URL
});

/**
 * Payment confirm URL
 */
router.get('/confirm', async (req, res, next) => {
    if (!req.query.transactionId || !req.query.orderId){
        // Required query string not found.
        return res.sendStatus(400);
    }

    // Lock to avoid duplicate capture request.
    const lock = await cache.create_with_key(true, `payment_lock_${req.query.transactionId}`, 30);
    if (!lock){
        return res.sendStatus(200);
    }

    // Get order
    const order_id = req.query.orderId;
    let order = await db.get("order", order_id);

    if (!(order && order.line_user_id && order.line_pay_amount && order.line_pay_currency)){
        debug("Order not found or required parameter not included.");
        return res.sendStatus(400);
    }

    debug(`Going to run capturing payment for orderId: ${order_id}.`);

    // Make the order paid.
    let order_updates = {
        status: "paid",
        paid_at: new Date(),
        line_pay_status: "paid",
        line_pay_paid_at: new Date()
    }

    try {
        await db.update("order", order_updates, order_id);
    } catch(e){
        await line_event.botex_push({
            skill: "notify_paid",
            line_user_id: order.line_user_id,
            language: order.language,
            parameters: {
                status: `failed`,
                order: order,
                message_label: "failed_to_save_order"
            }
        })
    }

    // Confirm & Capture the payment.
    debug(`Going to confirm/capture payment...`);
    try {
        await pay.confirm({
            transactionId: req.query.transactionId,
            amount: order.line_pay_amount,
            currency: order.line_pay_currency
        });
        debug("Succeeded to capture payment.");
    } catch(e){
        debug("Failed to capture payment. Going to rollback..");

        // Revert order status to ordered.
        let order_updates = {
            status: "created",
            paid_at: null,
            line_pay_status: null,
            line_pay_reserved_at: null,
            line_pay_paid_at: null
        }
        await db.update("order", order_updates, order_id);
        debug(`Reverted order status to "ordered".`)

        debug("Failed to capture payment.");
        debug(`Transaction Id is ${req.query.transactionId}`);
        debug(`Order Id is ${order_id}`);
        debug(e);
        res.sendStatus(400);

        debug("Going to send error message to user.");
        await line_event.botex_push({
            skill: "notify_paid",
            line_user_id: order.line_user_id,
            language: order.language,
            parameters: {
                status: `failed`,
                order: order,
                message_label: "failed_to_capture_payment"
            }
        })

        return
    }

    res.sendStatus(200);

    debug("Trigger after payment skill.");
    await line_event.botex_push({
        skill: "notify_paid",
        line_user_id: order.line_user_id,
        language: order.language,
        parameters: {
            status: `completed`,
            order: order,
            message_label: "sending_receipt"
        }
    })
});

module.exports = router;
