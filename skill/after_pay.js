"use strict";

const debug = require("debug")("bot-express:skill");
const ServiceDb = require("../service/db");
const db = new ServiceDb();

/**
 * Following parameters need to be included.
 * {String} order_id
 * {Status} status
 * {String} message_label
 */
module.exports = class SkillAfterPay {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        // Get order
        const order = await db.get("order", context.heard.order_id);

        if (!order){
            throw new Error(`Order not found.`);
        }

        order.id = context.heard.order_id;

        let message;

        if (context.heard.status === `completed`){
            message = await bot.m.receipt({
                order: order,
            })
        } else if (context.heard.status === `paid`){
            message = {
                type: "text",
                text: await bot.t(context.heard.message_label),
            }
        } else if (context.heard.status === `failed`){
            message = {
                type: "text",
                text: await bot.t(context.heard.message_label),
            }
        }

        await bot.reply(message);
    }
}