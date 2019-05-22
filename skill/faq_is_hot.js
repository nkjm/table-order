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

        await bot.reply(message);
    }
}
