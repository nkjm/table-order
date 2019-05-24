"use strict";

const debug = require("debug")("bot-express:skill");
const ServiceDb = require("../service/db");
const db = new ServiceDb();
const translate = require("../service/translate");

module.exports = class SkillFaqSearchItem {
    constructor(){
        this.clear_context_on_finish = true;

        this.required_parameter = {
            item_label: {
                message: async (bot, event, context) => {
                    let message = {
                        type: "text",
                        text: await bot.t("pls_tell_me_item_you_are_looking_for")
                    } 
                    return message;
                },
                parser: "string"
            }
        }
    }

    async finish(bot, event, context){
        const menu_list = translate(await db.list("menu"), context.sender_language || "en");
        const item = menu_list.find(menu => menu.label === context.confirmed.item_label);

        if (!item){
            return await bot.reply({
                type: "text",
                text: await bot.t("sorry_we_do_not_have_x", { item_label: context.confirmed.item_label})
            })
        }

        let message = {
            type: "text",
            text: await bot.t(`yes_we_have_x`, { item_label: item.label }),
        }

        // If this is sub_skill, quick reply returns item label only to apply to label parameter. 
        // If this is parent skill, quick reply return sentence to launch order skill.
        message = await bot.m.qr_push_item(message, {
            type: "action",
            action: {
                type: "message",
                label: await bot.t("order_x", { item_label: item.label }),
                text: (context._sub_skill) ? item.label : await bot.t("i_like_to_order_x", { item_label: item.label })
            }
        })

        await bot.reply(message);
    }
}
