"use strict";

const debug = require("debug")("bot-express:skill");

/**
 * Following parameters need to be included.
 * {Object} order
 * {Status} status - "completed" | "failed"
 * {String} message_label
 */
module.exports = class SkillNotifyPaid {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        if (!context.heard.order){
            throw new Error(`Order not found.`);
        }

        let message;
        if (context.heard.status === `completed`){
            message = await bot.m.receipt({
                order: context.heard.order,
            })
        } else if (context.heard.status === `failed`){
            message = {
                type: "text",
                text: await bot.t(context.heard.message_label),
            }
        }

        await bot.reply(message);
    }
}