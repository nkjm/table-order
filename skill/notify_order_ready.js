"use strict";

const debug = require("debug")("bot-express:skill");

/**
 * Following parameters need to be included.
 * {String} order
 */
module.exports = class SkillNotifyOrderReady {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        if (!context.heard.order){
            throw new Error(`Order not found.`);
        }

        let message = await bot.m.order_ready({
            order: context.heard.order
        });
        await bot.reply(message);
    }
}