"use strict";

const express = require('express');
const router = express.Router();
const debug = require("debug")("bot-express:route");
const line_event = require("../service/line_event");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ServiceDb = require("../service/db");
const db = new ServiceDb();

router.use(require('body-parser').raw({type: '*/*'}));

function extract_session(req){
    let sig = req.headers["stripe-signature"];

    // Validate signature and extract event.
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_CHECKOUT_SIGNATURE_SECRET);
    
    let session;

    // Extract session from event.
    if (event.type === 'checkout.session.completed') {
        session = event.data.object;
    }

    debug(`Extracted session follows.`);
    debug(session);

    return session;
}

async function rollback(order, session){
    const intent = await stripe.paymentIntents.retrieve(session.payment_intent);

    const refund = await stripe.refunds.create({
        charge: intent.charges.data[0].id
    });

    debug(`Refund/Rollback completed.`)
}

/**
 * @method
 * @async
 * @param {Object} options
 * @param {String} options.status - failed | paid | completed
 * @param {String} options.line_user_id
 * @param {String} options.order_id
 * @param {String} options.message_label
 * @param {String} [options.language="ja"]
 */
async function notify_payment_status(options){
    const o = options;

    await line_event.fire({
        type: "bot-express:push",
        to: {
            type: "user",
            userId: o.line_user_id
        },
        intent: {
            name: "after_pay",
            parameters: {
                status: o.status,
                order_id: o.order_id,
                message_label: o.message_label
            }
        },
        language: o.language || "ja"
    });
}

/**
 * Checkout webhook.
 * When we receive event on this webhook, payment has been completed.
 */
router.post("/checkout/webhook", async (req, res, next) => {
    // Validate signature and extract stripe session.
    let session;
    try {
        session = extract_session(req);
    } catch (err) {
        debug(`Event construction failed.`);
        debug(err.message || `May be due to signature validation failure.`);
        return res.sendStatus(400);
    }
    
    // Return acknowledge.
    res.json({ received: true });

    // Get order by session id.
    const query_snapshot = await db.firestore.collection("order").where("stripe_session_id", "==", session.id).get();

    const order_list = [];
    query_snapshot.forEach(doc => {
        const order = doc.data();
        order.id = doc.id;
        order_list.push(order);
    })
    const order = order_list[0];

    // Check if there is corresponding order.
    if (!(order && order.line_user_id)){
        debug("Order not found or required parameter not included so skip processing.");
        return;
    }

    // Used if this payment require reservation.
    const reservation_list = [];

    // Make the order paid.
    let order_updates = {
        stripe_status: "paid",
        stripe_paid_at: new Date()
    }

    // Update order to paid.
    try {
        await db.update("order", order_updates, order.id);
    } catch(e){
        debug(`Failed to update order status to "paid". Going to rollback..`)

        // If any of the reservation fails, we need to rollback payment and reservation.
        await rollback(order, session);

        await notify_payment_status({
            status: "failed",
            line_user_id: order.line_user_id,
            order_id: order.id,
            language: order.language || "ja",
            message_label: "failed_to_save_order_so_we_rollback_payment"
        })

        return;
    }

    debug("Trigger after payment skill.");
    await notify_payment_status({
        status: "completed",
        line_user_id: order.line_user_id,
        order_id: order.id,
        language: order.language || "ja",
        message_label: "sending_receipt"
    })
});

router.get("/checkout/success", (req, res, next) => {
    return res.render("close_liff");
})

router.get("/checkout/cancel", (req, res, next) => {
    return res.render("close_liff");
})

module.exports = router;
