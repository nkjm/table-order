"use strict";

const debug = require("debug")("bot-express:skill");

module.exports = class SkillFollow {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        // Link richmenu.
        if (process.env.BOT_EXPRESS_ENV !== "test"){
            await bot.line.sdk.linkRichMenuToUser(bot.extract_sender_id(), process.env.RICHMENU_CONTROL_PANEL);
        }

        let message = {
            type: "text",
            text: await bot.t(`follow_message`)
        }
        
        await bot.reply(message);
    }
}