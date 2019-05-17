"use strict";

const debug = require("debug")("bot-express:service");
const crypto = require("crypto");
const request = require("request");
Promise = require("bluebird");
Promise.promisifyAll(request);

/**
Utility to trigger LINE webhook event.
@class
*/
class ServiceLineEvent {
    /**
    Start conversation from chatbot using provided webhook event.
    @method
    @param {Object} event - Webhook event object of LINE Messaging API.
    */
    static fire(event){
        let url = `http://localhost:${process.env.PORT || 5000}/bot/webhook`;

        let body = {events: [event]};
        let signature = crypto.createHmac('sha256', process.env.LINE_CHANNEL_SECRET).update(JSON.stringify(body)).digest('base64');
        let headers = {"X-Line-Signature": signature};
        return request.postAsync({
            url: url,
            headers: headers,
            body: body,
            json: true
        });
    }
}

module.exports = ServiceLineEvent;
