"use strict";

const functions = require('firebase-functions');
const request = require("request");
const Promise = require("bluebird");
const debug = require("debug")("*");
const crypto = require("crypto");
Promise.promisifyAll(request);

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// If the order status is updated from "paid" to "ready", we send ready message through LINE
exports.send_ready_message = functions.firestore.document('restaurants/{restaurante_id}/orders/{order_id}').onUpdate((change, context) => {
    let order = change.after.data();
    let previous_order = change.before.data();

    if (!(order.status == "ready" && previous_order.status == "paid")){
        return Promise.resolve();
    }

    if (!order.line_user_id){
        debug("Required parameter: line_user_id not found.");
        return Promise.reject("Required parameter: line_user_id not found.");
    }

    let event = {
        type: "bot-express:push",
        to: {
            type: "user",
            userId: order.line_user_id
        },
        intent: {
            name: "send-ready-message",
            parameters: {
                order: order
            }
        },
        language: order.language || "ja"
    }
    let body = {events: [event]};
    let signature = crypto.createHmac('sha256', process.env.LINE_BOT_CHANNEL_SECRET).update(JSON.stringify(body)).digest('base64');
    let url = process.env.LINE_BOT_WEBHOOK_URL;
    let headers = {"X-Line-Signature": signature};
    return request.postAsync({
        url: url,
        headers: headers,
        body: body,
        json: true
    });
});
