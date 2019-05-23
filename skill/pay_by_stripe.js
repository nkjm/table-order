"use strict";

// Required environment variables
const SUCCESS_URL = process.env.STRIPE_CHECKOUT_CALLBACK_SUCCESS;
const CANCEL_URL = process.env.STRIPE_CHECKOUT_CALLBACK_CANCEL;
const LIFF_STRIPE = process.env.LIFF_STRIPE;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Required translation labels.
// - please_input_credit_card
// - input_credit_card

// Required parameter to be passed in launching this skill
const required_parameter_list = ["order_id", "name", "amount"];

// Optional parameter can be passed in launching this skill
const optional_parameter_list = [{
    name: "currency",
    default: "jpy"
},{
    name: "quantity",
    default: 1
},{
    name: "description"
},{
    name: "images"
}]

// Required packages in common.
const debug = require("debug")("bot-express:skill");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

// Required packages in this app.
const ServiceDb = require("../service/db");
const db = new ServiceDb();

// Required modules other than this skill.
// - routes/liff.js (Contain router setting for /liff/stripe and render web/src/ejs/stripe.ejs)
// - web/src/ejs/stripe.ejs (Load https://js.stripe.com/v3/ and web/src/js/stripe.js)
// - web/src/js/stripe.js (Instantiate stripe and redirect to form hosted by stripe)
// - routes/stripe.js (Webhook to receivec event indicating session completion)
// - web/src/ejs/close_liff.ejs (Page to just close LIFF app. Load web/src/js/close_liff.js)
// - web/src/js/close_liff.js (Close LIFF app)

module.exports = class SkillPayByStripe {
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

        // Set required parameters.
        const line_item = {
            name: context.heard.name,
            amount: context.heard.amount
        }

        // Check if optional parameter is set in context heard.
        // If set, we use it.
        // If not set, we set default value if it exits.
        for (const optional_parameter of optional_parameter_list){
            if (context.heard[optional_parameter.name] !== undefined){
                line_item[optional_parameter.custom_name || optional_parameter.name] = context.heard[optional_parameter.name];
            } else if (optional_parameter.default !== undefined) {
                line_item[optional_parameter.custom_name || optional_parameter.name] = optional_parameter.default;
            } 
        }

        debug(`line_item follows.`)
        debug(line_item);

        // Create stripe session.
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [line_item],
            success_url: SUCCESS_URL,
            cancel_url: CANCEL_URL,
            locale: context.sender_language || process.env.BOT_LANGUAGE || "en" 
        });

        debug("Stripe session follows.");
        debug(JSON.stringify(session));

        // Start of application based process.
        // We update existing order to add session information.
        let order_updates = {
            // Common fields
            payment_provider: "stripe",
            // Payment provider fields
            stripe_status: "created_session",
            stripe_name: context.heard.name,
            stripe_amount: context.heard.amount,
            stripe_session_id: session.id,
            stripe_created_session_at: new Date(),
            stripe_currency: line_item.currency,
        }
        await db.update("order", order_updates, context.heard.order_id);
        // End of application based process

        // Provide payment button.
        const payment_uri = `line://app/${LIFF_STRIPE}?session_id=${encodeURIComponent(session.id)}`
        let message = await bot.m.single_button({
            message_text: await bot.t("please_input_credit_card"),
            action: {
                type: "uri",
                label: await bot.t("input_credit_card"),
                uri: payment_uri,
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

        // Link richmenu.
        if (process.env.BOT_EXPRESS_ENV !== "test"){
            await bot.line.sdk.linkRichMenuToUser(bot.extract_sender_id(), process.env.RICHMENU_CONTROL_PANEL);
        }
    }
}