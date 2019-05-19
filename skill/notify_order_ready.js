"use strict";

const debug = require("debug")("bot-express:skill");

module.exports = class SkillNotifyOrderReady {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        let message = await bot.m.order_ready({
            order: context.heard.order
        });
        await bot.reply(message);
    }
}