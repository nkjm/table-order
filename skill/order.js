"use strict";

const debug = require("debug")("bot-express:skill");
const parser = require("../parser/order");
const ServiceDb = require("../service/db");
const db = new ServiceDb();
const translate = require("../service/translate");

module.exports = class SkillOrder {
    async begin(bot, event, context){
        // Retrieve menu from db.
        context.confirmed.menu_list = translate(db.list("menu"), context.sender_language || "ja");
    }

    constructor(){
        this.clear_context_on_finish = true;

        this.required_parameter = {
            order_item_list: {
                list: {
                    order: "old"
                },
                message_to_confirm: async (bot, event, context) => {
                    let order_item_message = await bot.m.order_item({
                        message_text: await bot.t(`may_i_have_your_order`), 
                        menu_list: context.confirmed.menu_list
                    });

                    let message_list = [{
                        type: "text",
                        text: await bot.t(`pls_select_order`)
                    }, order_item_message];

                    return message_list;
                },
                parser: parser.order_item,
                reaction: async (error, value, bot, event, context) => {
                    if (error) return;

                    // If there is the same menu in order item list, we move the order item to top of the list and increment the quantity if it is set in value.
                    let is_existing = false;
                    let i = 0;
                    for (let order_item of context.confirmed.order_item_list){
                        if (order_item.label == value.label){
                            is_existing = true;
                            let order_item_to_increment_quantity = context.confirmed.order_item_list.splice(i, 1)[0];
                            context.confirmed.order_item_list.unshift(order_item_to_increment_quantity);

                            if (value.quantity){
                                context.confirmed.order_item_list[0].quantity += value.quantity;
                            }
                        }
                        i++;
                    }

                    if (!is_existing){
                        // This is new item so we just add it to top of the order item list.
                        context.confirmed.order_item_list.unshift(value);
                    }

                    // Calculate amount. It can be 0 since quantity may be 0 but will be set in reaction of quantity.
                    context.confirmed.order_item_list[0].amount = context.confirmed.order_item_list[0].quantity * context.confirmed.order_item_list[0].unit_price;

                    // If order item does not include quantity, we ask it.
                    if (!value.quantity){
                        bot.collect("quantity");
                    }
                }
            },
            review_order_item_list: {
                message_to_confirm: async (bot, event, context) => {
                    let message;
                    if (context.confirmed.order_item_list.length > 0){
                        // We have some order items.
                        message = await bot.m.review_order_item_list(context.confirmed.order_item_list);
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
                        list: [await bot.t(`remove`), await bot.t(`add`), await bot.t(`check`), await bot.t(`quit`)]
                    })
                },
                reaction: async (error, value, bot, event, context) => {
                    if (error) return;

                    if (value == await bot.t(`remove`)){
                        debug(`We will cancel some order item.`);
                        bot.collect("review_order_item_list");
                        bot.collect("order_item_to_remove");
                    } else if (value == await bot.t(`add`)){
                        debug(`We will add another order item.`);
                        bot.collect("review_order_item_list");
                        bot.collect("order_item");
                    } else if (value == await bot.t(`check`)){
                        debug(`We can proceed to payment.`);
                    } else if (value == await bot.t(`quit`)){
                        debug(`We quit order.`);
                        await bot.reply({
                            type: "text",
                            text: `${await bot.t("certainly")} ${await bot.t("quit_order")}`
                        })
                        bot.init();
                    }
                }
            }
        }

        this.optional_parameter = {
            quantity: {
                message_to_confirm: async (bot, event, context) => {
                    let message = {
                        type: "text",
                        text: await bot.t(`pls_tell_me_quantity_of_the_item`, {
                            item_label: context.confirmed.order_item_list[0].label
                        })
                    }
                    return message;
                },
                parser: {
                    type: "number"
                },
                reaction: (error, value, bot, event, context) => {
                    if (error) return;

                    context.confirmed.order_item_list[0].quantity += value;
                    context.confirmed.order_item_list[0].amount = context.confirmed.order_item_list[0].quantity * context.confirmed.order_item_list[0].unit_price;
                }
            },
            order_item_to_remove: {
                message_to_confirm: async (bot, event, context) => {
                    let message = await flex.carousel_message("cancel_order_item", await bot.t(`pls_select_order_to_cancel`), context.confirmed.order_item_list);
                    return message;
                },
                parser: async (value, bot, event, context) => {
                    if (typeof value != "string") throw new Error("should_be_string");

                    let order_item_to_remove = context.confirmed.order_item_list.find(order_item => order_item.label === value);

                    if (!order_item_to_cancel){
                        throw new Error("invalid_value");
                    }

                    return order_item_to_remove;
                },
                reaction: async (error, value, bot, event, context) => {
                    if (error) return;

                    let i = 0;
                    for (let order_item of context.confirmed.order_item_list){
                        if (order_item.label === value.label){
                            let canceled_order_item = context.confirmed.order_item_list.splice(i, 1)[0];
                            bot.queue({
                                type: "text",
                                text: `${await bot.t("certainly")} ${await bot.t("the_item_has_been_removed", {
                                    item_label: canceled_order_item.label
                                })}`
                            })
                        }
                        i++;
                    }
                }
            }
        }
    }

    async finish(bot, event, context){
        let total_amount = 0;
        for (let order_item of context.confirmed.order_item_list){
            total_amount += order_item.amount;
        }

        // Save reservation so taht confirm URL can retrieve this information. *restaurant info will be downsized.
        const order_id = await db.create("order", {
            // Common fields
            created_at: new Date(),
            line_user_id: bot.extract_sender_id(),
            language: context.sender_language || "ja",
            // Application fields
            amount: total_amount,
            item_list: context.confirmed.order_item_list,
            restaurant_id: context.confirmed.restaurant.id
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