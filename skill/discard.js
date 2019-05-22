"use strict";

const debug = require("debug")("bot-express:skill");
const SkillRobotResponse = require("./robot_response");

module.exports = class SkillDiscard extends SkillRobotResponse {
    constructor(){
        super();
    }

    async begin(bot, event, context){
        // Link richmenu.
        if (process.env.BOT_EXPRESS_ENV !== "test"){
            await bot.line.sdk.linkRichMenuToUser(bot.extract_sender_id(), process.env.RICHMENU_CONTROL_PANEL);
        }
    }
}
