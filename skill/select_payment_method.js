"use strict";

const debug = require("debug")("bot-express:skill");

// Default configuration.
const DEFAULT_METHOD = "pay_by_line_pay";

// Required parameter to be passed in launching this skill.
const REQUIRED_PARAMETER_LIST = ["order_id", "name", "amount"];

module.exports = class SkillSelectPaymentMethod {
    constructor(){
        this.required_parameter = {
            payment_method: {
                condition: async (bot, event, context) => {
                    if (process.env.ASK_PAYMENT_METHOD === "enable"){
                        return true;
                    }
                    return false;
                },
                message: async (bot, event, context) => {
                    let message = await bot.m.text_with_qr({
                        message_text: await bot.t(`pls_select_payment_method`),
                        action_text_list: [await bot.t(`credit_card`), await bot.t(`line_pay`)]
                    })
                    return message;
                },
                parser: async (value, bot, event, context) => {
                    return bot.builtin_parser.list.parse(value, {
                        list: [await bot.t(`credit_card`), await bot.t(`line_pay`)]
                    })
                }
            }
        }
    }

    async finish(bot, event, context){
        // Check if we have all the required parameters.
        for (const p of REQUIRED_PARAMETER_LIST){
            if (context.heard[p] === undefined){
                throw new Error(`Required parameter "${p}" not set.`);
            }
        }

        // Set payment skill. Default is LINE Pay.
        let payment_skill = DEFAULT_METHOD;
        if (context.confirmed.payment_method === await bot.t(`credit_card`)){
            payment_skill = `pay_by_stripe`;
        } else if (context.confirmed.payment_method === await bot.t(`line_pay`)){
            payment_skill = `pay_by_line_pay`;
        }

        // Start pay skill.
        bot.switch_skill({
            name: payment_skill,
            parameters: context.heard
        })
    }
}