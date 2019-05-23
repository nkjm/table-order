"use strict";

const debug = require("debug")("bot-express:skill");
const ServiceDb = require("../service/db");
const db = new ServiceDb();
const translate = require("../service/translate");

module.exports = class SkillOrder {
    constructor(){
        /**
         * If set to true, context will be cleared when skill finishes.
         */
        this.clear_context_on_finish = true;

        /**
         * Required parametes to finish this skill.
         */
        this.required_parameter = {
            order_item_list: {
                list: {
                    order: "new"
                },
                sub_parameter: {
                    label: {
                        message: async (bot, event, context) => {
                            let order_item_message = await bot.m.order_item({
                                message_text: await bot.t(`may_i_have_your_order`), 
                                menu_list: context.global.menu_list
                            });

                            // Add quit button.
                            order_item_message = await bot.m.qr_add_quit(order_item_message);

                            let message_list = [{
                                type: "text",
                                text: await bot.t(`pls_select_order`)
                            }, order_item_message];

                            return message_list;
                        },
                        parser: async (value, bot, event, context) => {
                            const label_type_list = Array.from(context.global.menu_list, menu => menu.label);
                            let parsed_value;
                            try {
                                parsed_value = await bot.builtin_parser.list.parse(value, {
                                    list: label_type_list
                                })
                            } catch(e) {
                                parsed_value = await bot.builtin_parser.dialogflow.parse(value, {
                                    parameter_name: "order_item_label"
                                })
                            }
                            return parsed_value;
                        },
                        sub_skill: ["faq_is_hot"]
                    },
                    quantity: {
                        message: async (bot, event, context) => {
                            let message = await bot.m.text_with_qr({
                                message_text: await bot.t("pls_tell_me_quantity_of_the_item", { label: context.confirmed.label }),
                                action_text_list: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
                            });

                            message = await bot.m.qr_add_modify_prev_param(message, context);

                            return message;
                        },
                        parser: {
                            type: "number"
                        }
                    }
                },
                reaction: async (error, value, bot, event, context) => {
                    const deduped_order_item_list = [];

                    // Dedup order_item_list and set image, unit_price and amount.
                    if (Array.isArray(context.confirmed.order_item_list)){
                        for (const order_item of context.confirmed.order_item_list){
                            const deduped_order_item = deduped_order_item_list.find(deduped_order_item => deduped_order_item.label === order_item.label);
                            // If duplication found, we merge them and increment quantity.
                            if (deduped_order_item){
                                debug(`This is duplicated item. We merge and increment quantity.`);
                                deduped_order_item.quantity += order_item.quantity;
                                deduped_order_item.amount = deduped_order_item.unit_price * deduped_order_item.quantity;
                            } else {
                                order_item.image = context.global.menu_list.find(menu => menu.label === order_item.label).image
                                order_item.unit_price = context.global.menu_list.find(menu => menu.label === order_item.label).price
                                order_item.amount = order_item.unit_price * order_item.quantity;
                                deduped_order_item_list.push(order_item);
                            }
                        }
                    }

                    context.confirmed.order_item_list = deduped_order_item_list;
                }
            },
            review_order_item_list: {
                message: async (bot, event, context) => {
                    let message;
                    if (context.confirmed.order_item_list.length > 0){
                        // We have some order items.
                        message = await bot.m.review_order_item_list(context.confirmed.order_item_list);

                        // Add quit button.
                        message = await bot.m.qr_add_quit(message);
                    } else {
                        // order item list is emply.
                        message = await bot.m.multi_button({
                            message_text: `${await bot.t("there_is_no_order")} ${await bot.t("do_you_add_order")}`,
                            action_list: [{
                                type: "message",
                                label: await bot.t(`quit`),
                                text: await bot.t(`quit`)
                            },{
                                type: "message",
                                label: await bot.t(`add`),
                                text: await bot.t(`add`)
                            }]
                        })
                    }
                    return message;
                },
                parser: async (value, bot, event, context) => {
                    return bot.builtin_parser.list.parse(value, {
                        list: [await bot.t(`remove`), await bot.t(`add`), await bot.t(`check`)]
                    })
                },
                reaction: async (error, value, bot, event, context) => {
                    if (error) return;

                    if (value == await bot.t(`remove`)){
                        // Ask item to remove.
                        if (!(Array.isArray(context.confirmed.order_item_list) && context.confirmed.order_item_list.length > 0)){
                            bot.collect("review_order_item_list");
                            return
                        }
                        bot.collect("review_order_item_list");
                        bot.collect("order_item_to_remove");
                    } else if (value == await bot.t(`add`)){
                        // Ask item to add.
                        bot.collect("review_order_item_list");
                        bot.collect("order_item_list");
                    } else if (value == await bot.t(`check`)){
                        // Proceed as long as order_item_list is set.
                        if (!(Array.isArray(context.confirmed.order_item_list) && context.confirmed.order_item_list.length > 0)){
                            bot.collect("review_order_item_list");
                            return
                        }
                    }
                }
            }
        }

        /**
         * Parameters to be collected only when explicitly collected by bot.collect() method.
         * In this skill, order_item_to_remove is collected when user wants to remove some ordered item.
         */
        this.optional_parameter = {
            order_item_to_remove: {
                message: async (bot, event, context) => {
                    let message = await bot.m.order_item_to_remove({
                        message_text: await bot.t(`pls_select_order_to_cancel`), 
                        order_item_list: context.confirmed.order_item_list
                    });
                    return message;
                },
                parser: async (value, bot, event, context) => {
                    const label_type_list = Array.from(context.confirmed.order_item_list, order_item => order_item.label);
                    return bot.builtin_parser.list.parse(value, {
                        list: label_type_list
                    })
                },
                reaction: async (error, value, bot, event, context) => {
                    if (error) return;

                    // Remove item from order_item_list.
                    let i = 0;
                    for (const order_item of context.confirmed.order_item_list){
                        if (order_item.label === value){
                            let removed_order_item = context.confirmed.order_item_list.splice(i, 1)[0];
                            bot.queue({
                                type: "text",
                                text: `${await bot.t("certainly")} ${await bot.t("the_item_has_been_removed", {
                                    item_label: removed_order_item.label
                                })}`
                            })
                        }
                        i++;
                    }
                }
            }
        }
    }

    /**
     * Runs when conversation starts.
     */
    async begin(bot, event, context){
        // Retrieve menu from db.
        context.global.menu_list = translate(await db.list("menu"), context.sender_language || "en");

        // Unink richmenu temporarily to expand available screen size.
        if (process.env.BOT_EXPRESS_ENV !== "test"){
            await bot.line.sdk.unlinkRichMenuFromUser(bot.extract_sender_id(), process.env.RICHMENU_CONTROL_PANEL);
        }
    }

    /**
     * Runs when context is expired. 
     */
    async on_abort(bot, event, context){
        // Link richmenu.
        if (process.env.BOT_EXPRESS_ENV !== "test"){
            await bot.line.sdk.linkRichMenuToUser(bot.extract_sender_id(), process.env.RICHMENU_CONTROL_PANEL);
        }

        await bot.send(bot.extract_sender_id(), {
            type: "text",
            text: await bot.t("no_answer_for_a_while_so_we_quit_this_order_for_now") 
        })
    }

    /**
     * Runs when all the required parameters are collected.
     */
    async finish(bot, event, context){
        let total_amount = 0;
        for (let order_item of context.confirmed.order_item_list){
            total_amount += order_item.amount;
        }

        // Save reservation so taht confirm URL can retrieve this information. *restaurant info will be downsized.
        const order_id = await db.create("order", {
            // Common fields
            status: "created",
            created_at: new Date(),
            line_user_id: bot.extract_sender_id(),
            language: context.sender_language || "en",
            // Application fields
            reference_number: String(Math.floor(Math.random() * (9999 - 1000)) + 1000),
            amount: total_amount,
            item_list: context.confirmed.order_item_list
        })

        // Start select_payment_method skill.
        bot.switch_skill({
            name: "select_payment_method",
            parameters: {
                order_id: order_id,
                name: await bot.t(`food_fee`),
                amount: total_amount
            }
        })
    }
}