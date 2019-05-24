"use strict";

const debug = require("debug")("bot-express:skill");
const ServiceDb = require("../service/db");
const db = new ServiceDb();
const translate = require("../service/translate");

module.exports = class SkillFaqRecommendation {
    constructor(){
        this.clear_context_on_finish = true;

        this.required_parameter = {
            ingredient: {
                message: async (bot, event, context) => {
                    let message = await bot.m.text_with_qr({
                        message_text: await bot.t("which_ingredients_do_you_like"),
                        action_text_list: Array.from(context.global.ingredient_list, ingredient => ingredient.label)
                    })
                    return message;
                },
                parser: "string"
            }
        }
    }

    async begin(bot, event, context){
        context.global.ingredient_list = [{
            name: "vegetable",
            label: await bot.t("vegetable")
        },{
            name: "chicken",
            label: await bot.t("chicken")
        },{
            name: "pork",
            label: await bot.t("pork"),
        },{
            name: "seafood", 
            label: await bot.t("seafood")
        }];
    }

    async finish(bot, event, context){
        const menu_list = translate(await db.list("menu"), context.sender_language || "en");
        const ingredient = context.global.ingredient_list.find(ingredient => ingredient.label === context.confirmed.ingredient) || {};
        const recommended_item = menu_list.find(menu => menu.ingredient === ingredient.name);

        if (!recommended_item){
            return await bot.reply({
                type: "text",
                text: await bot.t("sorry_we_have_no_recommendation_for_you")
            })
        }

        let message = {
            type: "text",
            text: await bot.t(`our_recommendation_is_x`, { item_label: recommended_item.label }),
        }
        message = await bot.m.qr_push_item(message, {
            type: "action",
            action: {
                type: "message",
                label: await bot.t("order_x", { item_label: recommended_item.label }),
                text: (context._sub_skill) ? recommended_item.label : await bot.t("i_like_to_order_x", { item_label: recommended_item.label })
            }
        })

        await bot.reply(message);
    }
}
