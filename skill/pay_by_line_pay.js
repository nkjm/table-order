"use strict";

// Required parameter to be passed in launching this skill
const required_parameter_list = ["order_id", "name", "amount"];

// Optional parameter can be passed in launching this skill
const optional_parameter_list = [{
    name: "currency",
    default: "JPY"
},{
    name: "image",
    custom_name: "productImageUrl"
}]

const debug = require("debug")("bot-express:skill");
const ServiceDb = require("../service/db");
const db = new ServiceDb();
const Pay = require("line-pay");
const pay = new Pay({
    channelId: process.env.LINE_PAY_CHANNEL_ID,
    channelSecret: process.env.LINE_PAY_CHANNEL_SECRET,
    isSandbox: (process.env.LINE_PAY_ENV === "sandbox") ? true : false,
    proxyUrl: (process.env.LINE_PAY_ENV === "sandbox") ? null : process.env.FIXIE_URL
});

module.exports = class SkillPayByLinePay {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
        // Check if we have all the required parameters.
        for (const p of required_parameter_list){
            if (context.heard[p] === undefined){
                throw new Error(`Required parameter "${p}" not set.`);
            }
        }

        const reservation = {
            orderId: context.heard.order_id,
            productName: context.heard.name,
            amount: context.heard.amount,
            confirmUrl: process.env.LINE_PAY_CONFIRM_URL,
            confirmUrlType: "SERVER",
            langCd: context.sender_language || process.env.BOT_LANGUAGE || "en" 
        }

        // Check if optional parameter is set in context heard.
        // If set, we use it.
        // If not set, we set default value if it exits.
        for (const optional_parameter of optional_parameter_list){
            if (context.heard[optional_parameter.name] !== undefined){
                reservation[optional_parameter.custom_name || optional_parameter.name] = context.heard[optional_parameter.name];
            } else if (optional_parameter.default !== undefined) {
                reservation[optional_parameter.custom_name || optional_parameter.name] = optional_parameter.default;
            } 
        }

        // Reserve payment.
        debug("Going to reserve following payment.");
        debug(reservation);
        const payment_response = await pay.reserve(reservation);

        let order_updates = {
            payment_provider: "line_pay",
            line_pay_status: "reserved_payment",
            line_pay_product_name: context.heard.name,
            line_pay_amount: context.heard.amount,
            line_pay_currency: "JPY",
            line_pay_reserved_payment_at: new Date(),
            line_pay_transaction_id: payment_response.info.transactionId,
        }

        // Save reservation so that confirm URL can retrieve this information.
        await db.update("order", order_updates, context.heard.order_id);

        // Now we can provide payment URL.
        let message = await bot.m.single_button({
            message_text: await bot.t(`pls_pay_by_line_pay`),
            action: {
                type: "uri",
                label: await bot.t(`pay_x_yen`, {
                    amount: context.heard.amount
                }),
                uri: `line://app/${process.env.LIFF_LINE_PAY}/?payment_url=${encodeURIComponent(payment_response.info.paymentUrl.web)}`,
                style: "primary"
            }
        })

        // Add quit button.
        message = await bot.m.qr_add_quit(message);

        // Add change payment method button.
        if (process.env.ASK_PAYMENT_METHOD === `enable`){
            message = await bot.m.qr_push_item(message, {
                type: "action",
                action: {
                    type: "postback",
                    label: await bot.t("change_payment_method"),
                    displayText: await bot.t("change_payment_method"),
                    data: JSON.stringify({
                        type: "intent",
                        intent: {
                            name: "select_payment_method",
                            parameters: context.heard
                        },
                        language: context.sender_language || process.env.BOT_LANGUAGE || "en" 
                    })
                }
            })
        }

        await bot.reply(message);
    }
}