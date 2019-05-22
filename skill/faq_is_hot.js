"use strict";

const debug = require("debug")("bot-express:skill");
const ServiceDb = require("../service/db");
const db = new ServiceDb();
const translate = require("../service/translate");

module.exports = class SkillFaqIsHot {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        if (!context.heard.item_label){
            debug(`item_label not found so we skip request.`)
            return;
        }

        const menu_list = translate(await db.list("menu"), context.sender_language || "en");

        const item = menu_list.find(menu => menu.label === context.heard.item_label);

        if (!item){
            await bot.reply({
                type: "text",
                text: await bot.t("x_not_found_in_menu", { item_label: context.heard.item_label })
            })
            return
        }

        let message_text;
        if (item.hot === 3){
            message_text = await bot.t("x_is_extremely_hot", { item_label: item.label })
        } else if (item.hot === 2){
            message_text = await bot.t("x_is_moderately_hot", { item_label: item.label })
        } else if (item.hot === 1){
            message_text = await bot.t("x_is_not_hot_at_all", { item_label: item.label })
        } else {
            message_text = await bot.t("i_have_no_idea_how_hot_x_is", { item_label: item.label })
        }

        let message = {
            type: "text",
            text: message_text
        }

        // Check last message from bot in parent context and if quick reply found, we add it to the message.
        if (context._sub_skill && Array.isArray(context._parent) && context._parent.length > 0 && Array.isArray(context._parent[context._parent.length - 1].previous.message)){
            for (const parent_message of context._parent[context._parent.length - 1].previous.message){
                if (parent_message.from === "bot" && parent_message.skill === context._parent[context._parent.length - 1].skill.type){
                    // If previous message of parent context has quick reply, we add them.
                    if (parent_message.message.quickReply && Array.isArray(parent_message.message.quickReply.items)){
                        // If message of this skill has quick reply, we push quick reply of parent context to this message.
                        if (message.quickReply && Array.isArray(message.quickReply.items)){
                            for (const item of parent_message.message.quickReply.items){
                                message = await bot.m.qr_push_item(message, item);
                            }
                        } else {
                            message.quickReply = parent_message.message.quickReply;
                        }
                    }
                    break;
                }
            }
        }

        await bot.reply(message);
    }
}
