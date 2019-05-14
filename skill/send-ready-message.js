"use strict";

const debug = require("debug")("bot-express:skill");
const Translation = require("../translation/translation");
let t;
const Flex = require("../service/flex");
let flex;

module.exports = class SkillSendReadyMessage {
    async begin(bot, event, context){
        t = new Translation(bot.translator, context.sender_language);
        flex = new Flex(t);
    }

    constructor(){
        this.required_parameter = {
            order: {}
        }
    }

    async finish(bot, event, context){
        let message = await flex.order_ready_message(context.confirmed.order);
        debug(message);
        await bot.reply(message);
    }
}