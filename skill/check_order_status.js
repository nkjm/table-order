"use strict";

const debug = require("debug")("bot-express:skill");

module.exports = class SkillCheckOrderStatus {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        let message = {
            type: "text",
            text: await bot.t("it_will_be_ready_in_2_mins")
        }
        await bot.reply(message);
    }
}
