"use strict";

const functions = require('firebase-functions');
const debug = require("debug")("*");
const crypto = require("crypto");
const axios = require("axios");
const Promise = require("bluebird");

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// If the order status is updated from "paid" to "ready", we send ready message through LINE
exports.notify_order_ready = functions.firestore.document('/order/{order_id}').onUpdate((change, context) => {
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
            name: "notify_order_ready",
            parameters: {
                order: order
            }
        },
        language: order.language || "ja"
    }

    const body = {events: [event]};
    const signature = crypto.createHmac('sha256', process.env.LINE_BOT_CHANNEL_SECRET).update(JSON.stringify(body)).digest('base64');
    const url = process.env.LINE_BOT_WEBHOOK_URL;
    const headers = {"X-Line-Signature": signature};

    return axios.post(url, body, {
        headers: headers,
    });
});
