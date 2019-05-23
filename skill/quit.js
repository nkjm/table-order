"use strict";

const debug = require("debug")("bot-express:skill");

module.exports = class SkillQuit {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        // Link richmenu.
        if (process.env.BOT_EXPRESS_ENV !== "test"){
            await bot.line.sdk.linkRichMenuToUser(bot.extract_sender_id(), process.env.RICHMENU_CONTROL_PANEL);
        }

        await bot.reply({
            type: "text",
            text: `${await bot.t("certainly")} ${await bot.t("quit_order")}`
        })
    }
}
