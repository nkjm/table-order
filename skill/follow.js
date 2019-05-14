"use strict";

const debug = require("debug")("bot-express:skill");

module.exports = class SkillFollow {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        let message = {
            type: "text",
            text: await bot.t(`follow_message`)
        }
        
        await bot.reply(message);
    }
}