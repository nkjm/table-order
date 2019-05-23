"use strict";

const debug = require("debug")("bot-express:service");
const crypto = require("crypto");
const axios = require("axios");

/**
 * Utility to trigger LINE webhook event.
 * @class
 */
module.exports = class ServiceLineEvent {
    /**
     * Start conversation from chatbot using provided webhook event.
     * @method
     * @param {Object} event - Webhook event object of LINE Messaging API.
     */
    static async fire(event){
        const url = `http://localhost:${process.env.PORT || 5000}/bot/webhook`;
        const body = {events: [event]};
        const signature = crypto.createHmac('sha256', process.env.LINE_BOT_CHANNEL_SECRET).update(JSON.stringify(body)).digest('base64');
        const headers = {"X-Line-Signature": signature};

        return axios.post(url, body, {
            headers: headers,
        });
    }

    /**
     * @method
     * @async 
     * @param {Object} options
     * @param {String} options.line_user_id
     * @param {String} options.skill
     * @param {Object} [options.parameters]
     * @param {String} [options.language="en"]
     * @param {String} [options.to_type="user"]
     */
    static async botex_push(options){
        const req_param_list = ["line_user_id", "skill"]
        const o = options;
        
        for (const req_param of req_param_list){
            if (!o[req_param]) throw new Error(`Required option "${req_param}" not set.`)
        }

        const event = {
            type: "bot-express:push",
            to: {
                type: o.to_type || "user",
                userId: o.line_user_id
            },
            intent: {
                name: o.skill
            },
            language: o.language || "en"
        }

        if (o.parameters){
            event.intent.parameters = o.parameters
        }

        return ServiceLineEvent.fire(event);
    }
}