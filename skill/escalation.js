"use strict";

const debug = require("debug")("bot-express:skill");
const Translation = require("../translation/translation");
let t;
const Flex = require("../service/flex");
let flex;
const LINE_ADMIN_USER_ID = process.env.LINE_ADMIN_USER_ID;
const SUPPORTED_MESSAGE_TYPES = ["text"];

module.exports = class SkillEscalation {
    async begin(bot, event, context){
        t = new Translation(bot.translator, context.sender_language);
        flex = new Flex(t);
    }

    constructor(){
        this.clear_context_on_finish = (process.env.BOT_EXPRESS_ENV === "test") ? false : true;
    }

    async finish(bot, event, context){

        if (!SUPPORTED_MESSAGE_TYPES.includes(event.message.type)){
            debug(`${event.message.type} message type is not supported. We just skip processing this event.`);
            return;
        }

        if (!LINE_ADMIN_USER_ID){
            debug(`LINE_ADMIN_USER_ID not set.`);
            return;
        }

        // Get sender's displayName.
        let sender;
        if (process.env.BOT_EXPRESS_ENV == "test"){
            sender = {
                displayName: "Kazuki Nakajima"
            }
        } else {
            sender = await bot.plugin.line.sdk.getProfile(bot.extract_sender_id());
        }

        let message_text;
        if (context.sender_language !== bot.language && bot.translator){
            // We have translation so add it to the messages for admin.
            message_text = await bot.translator.translate(event.message.text, bot.language);
        } else {
            message_text = event.message.text;
        }

        let message = await flex.escalation_message({
            sender_id: bot.extract_sender_id(),
            sender_name: sender.displayName,
            sender_language: context.sender_language,
            bot_language: bot.language,
            message_text: message_text
        })

        // Send message to admin.
        await bot.send(LINE_ADMIN_USER_ID, message);
    }
};
