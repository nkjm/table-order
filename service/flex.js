"use strict";

const debug = require("debug")("bot-express:service");
let t;
const BOT_LANGUAGE = "ja";

class ServiceFlex {
    constructor(translation){
        t = translation;
    }

    /**
    Message for escalation
    @method
    @param {Object} options
    @param {String} options.sender_id
    @param {String} options.sender_name
    @param {String} options.sender_language
    @param {String} options.bot_language
    @param {String} options.message_text
    @return {FlexMessageObject}
    */
    async escalation_message(options){
        let o = options;

        let message = {
            type: "flex",
            altText: `${o.sender_name}から以下のメッセージを受信しました。`,
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{
                        type: "text",
                        text: `${o.sender_name}から以下のメッセージを受信しました。`,
                        size: "sm",
                        wrap: true
                    },{
                        type: "separator"
                    },{
                        type: "text",
                        text: o.message_text,
                        size: "md",
                        color: `#666666`,
                        wrap: true
                    }]
                },
                footer: {
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "postback",
                            label: `回答する`,
                            displayText: `回答する`,
                            data: JSON.stringify({
                                _type: "intent",
                                intent: {
                                    name: "human-response",
                                    parameters: {
                                        user: {
                                            id: o.sender_id,
                                            language: o.sender_language
                                        },
                                        question: o.message_text
                                    }
                                },
                                language: o.bot_language
                            })
                        }
                    }]
                }
            }
        }

        debug(JSON.stringify(message));

        return message;
    }

    /**
     * Message to notify order becomes ready.
     * @param {order} order 
     * @return {FlexMessageObject}
     */
    async order_ready_message(order){
        let message = {
            type: "flex",
            altText: await t.t("your_order_is_ready", {restaurante: order.restaurante.label}),
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{
                        type: "text",
                        text: await t.t(`order_id`),
                        align: "center",
                        size: "sm",
                        weight: "bold"
                    },{
                        type: "text",
                        text: order.id.split("-")[1],
                        align: "center",
                        size: "4xl",
                        weight: "bold"
                    },{
                        type: "separator"
                    },{
                        type: "text",
                        text: await t.t("your_order_is_ready", {restaurante: order.restaurante.label}),
                        wrap: true
                    }]
                }
            }
        } // End of message

        debug(JSON.stringify(message));

        return message;
    }

    /**
    Message for receipt
    @method
    @param {Array.<order>} order
    @return {FlexMessageObject}
    */
    async receipt_message(order){
        let total_amount = 0;
        let order_item_contents = [];
        for (let i of order.item_list){
            order_item_contents.push({
                type: "box",
                layout: "baseline",
                contents: [{
                    type: "text",
                    text: `${i.label}（${String(i.quantity)}${await t.t("unit")}）`,
                    size: "xs",
                    color: "#666666",
                    wrap: true
                },{
                    type: "text",
                    text: `${String(i.amount)}${await t.t("yen")}`,
                    size: "md",
                    align: "end",
                    flex: 0
                }]
            })
            total_amount += i.amount;
        }

        let message = {
            type: "flex",
            altText: await t.t(`receipt`),
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{
                        type: "text",
                        text: await t.t(`order_id`),
                        align: "center",
                        size: "sm",
                        weight: "bold"
                    },{
                        type: "text",
                        text: order.id.split("-")[1],
                        align: "center",
                        size: "4xl",
                        weight: "bold"
                    },{
                        type: "separator"
                    },{
                        type: "text",
                        text: await t.t(`receipt`),
                        weight: "bold",
                        size: "sm",
                        color: "#1DB446"
                    },{
                        type: "box",
                        layout: "vertical",
                        spacing: "md",
                        contents: order_item_contents
                    },{
                        type: "box",
                        layout: "baseline",
                        contents: [{
                            type: "text",
                            text: await t.t(`total_amount`),
                            size: "md",
                            color: "#000000",
                            wrap: true,
                            flex: 0
                        },{
                            type: "text",
                            text: `${String(total_amount)}${await t.t("yen")}`,
                            size: "xxl",
                            align: "end"
                        }]
                    },{
                        type: "separator"
                    },{
                        type: "text",
                        text: await t.t(`let_you_know_when_food_is_ready`),
                        wrap: true
                    }]
                }
            }
        } // End of message

        debug(JSON.stringify(message));

        return message;
    }

    /**
    Message to show menu
    @method
    @param {Object} menu
    @param {String} menu.label
    @param {String} menu.image
    @param {Number} menu.price
    */
    async menu_bubble(menu){
        let o = menu;
        const quantity_threshold = 4;

        let quantity_button_contents = [];
        let i = 0;
        for (let a of Array(quantity_threshold)){
            i++;
            quantity_button_contents.push({
                type: "button",
                style: "primary",
                height: "sm",
                action: {
                    type: "postback",
                    label: `${String(i)}${await t.t("unit")}`,
                    displayText: await t.t(`x_item`, {
                        item_label: o.label,
                        number: i
                    }),
                    data: JSON.stringify({
                        label: o.label,
                        quantity: i
                    })
                }
            })
        }

        let bubble = {
            type: "bubble",
            hero: {
                type: "image",
                url: o.image,
                size: "full",
                aspectRatio: "20:13",
                aspectMode: "cover"
            },
            body: {
                type: "box", // Contains label, quantity and amount.
                layout: "vertical",
                spacing: "md",
                contents: [{
                    type: "text", // label
                    text: o.label,
                    size: "xl",
                    weight: "bold",
                    wrap: true
                },{
                    type: "separator"
                },{
                    type: "box", // Contains price
                    layout: "horizontal",
                    spacing: "xl",
                    contents: [{
                        type: "box", // price.
                        layout: "baseline",
                        contents: [{
                            type: "text",
                            text: await t.t(`amount`),
                            color: "#999999",
                            size: "sm",
                            flex: 0
                        },{
                            type: "text",
                            text: `${String(o.price)}${await t.t("yen")}`,
                            size: "lg",
                            align: "end"
                        }]
                    }]
                },{
                    type: "separator"
                }]
            },
            footer: {
                type: "box", // Contains select button
                layout: "vertical",
                spacing: "md",
                contents: [{
                    type: "box",
                    layout: "horizontal",
                    spacing: "sm",
                    contents: quantity_button_contents
                },{
                    type: "button",
                    style: "secondary",
                    height: "sm",
                    action: {
                        type: "postback",
                        label: await t.t(`more_than_x_unit`, {
                            number: quantity_threshold + 1
                        }),
                        displayText: await t.t(`more_than_x_item`, {
                            item_label: o.label,
                            number: quantity_threshold + 1
                        }),
                        data: JSON.stringify({
                            label: o.label
                        })
                    }
                }]
            }
        }



        debug(JSON.stringify(bubble));

        return bubble;
    }

    /**
    Message having text and multiple horizontaly located button
    @method
    @param {Object} options
    @param {String} options.message_text
    @param {Array.<ActionObject>} option.action_list
    @return {FlexMessageObject}
    */
    async multi_button_message(options){
        let o = options;

        let button_contents = []
        for (let action of o.action_list){
            button_contents.push({
                type: "button",
                style: "link",
                height: "sm",
                action: action
            })
        }

        let message = {
            type: "flex",
            altText: o.message_text,
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "text",
                        text: o.message_text,
                        wrap: true
                    }]
                },
                footer: {
                    type: "box",
                    layout: "horizontal",
                    spacing: "sm",
                    contents: button_contents
                }
            }
        }

        return message;
    }

    /**
    Object expresses order item
    @typedef {Object} order_item
    @prop {String} label
    @prop {String} image
    @prop {Number} quantity
    @prop {Number} amount
    */

    /**
    Message to review order
    @method
    @param {Array.<order_item>} order_item_list
    @return {FlexMessageObject}
    */
    async review_message(order_item_list){

        let total_amount = 0;
        let order_item_contents = [];
        for (let i of order_item_list){
            order_item_contents.push({
                type: "box",
                layout: "baseline",
                contents: [{
                    type: "text",
                    text: `${i.label}（${String(i.quantity)}${await t.t("unit")}）`,
                    size: "xs",
                    color: "#666666",
                    wrap: true
                },{
                    type: "text",
                    text: `${String(i.amount)}${await t.t("yen")}`,
                    size: "md",
                    align: "end",
                    flex: 0
                }]
            })
            total_amount += i.amount;
        }

        let message = {
            type: "flex",
            altText: await t.t(`is_the_order_correct`),
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{
                        type: "text",
                        text: await t.t(`is_the_order_correct`),
                        wrap: true
                    },{
                        type: "separator",
                    },{
                        type: "box",
                        layout: "vertical",
                        spacing: "md",
                        contents: order_item_contents
                    },{
                        type: "box",
                        layout: "baseline",
                        contents: [{
                            type: "text",
                            text: await t.t(`total_amount`),
                            size: "md",
                            color: "#000000",
                            wrap: true,
                            flex: 0
                        },{
                            type: "text",
                            text: `${String(total_amount)}${await t.t("yen")}`,
                            size: "xxl",
                            align: "end"
                        }]
                    }]
                }, // End of body
                footer: {
                    type: "box",
                    layout: "vertical",
                    spacing: "md",
                    contents: [{
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "message",
                            label: await t.t(`check`),
                            text: await t.t(`check`)
                        }
                    },{
                        type: "box",
                        layout: "horizontal",
                        spacing: "md",
                        contents: [{
                            type: "button",
                            style: "secondary",
                            height: "sm",
                            action: {
                                type: "message",
                                label: await t.t(`modify`),
                                text: await t.t(`modify`)
                            }
                        },{
                            type: "button",
                            style: "secondary",
                            height: "sm",
                            action: {
                                type: "message",
                                label: await t.t(`add`),
                                text: await t.t(`add`)
                            }
                        }]
                    }]
                }
            }
        }

        return message;
    }

    /**
    Bubble to cancel order item
    @method
    @param {order_item} order_item
    @return {FlexBubble}
    */
    async cancel_order_item_bubble(order_item){
        let o = order_item;

        let bubble = {
            type: "bubble",
            hero: {
                type: "image",
                url: o.image,
                size: "full",
                aspectRatio: "20:13",
                aspectMode: "cover"
            },
            body: {
                type: "box", // Contains label, quantity and amount.
                layout: "vertical",
                spacing: "md",
                contents: [{
                    type: "text", // label
                    text: o.label,
                    size: "xl",
                    weight: "bold"
                },{
                    type: "separator"
                },{
                    type: "box", // Contains quantity and amount.
                    layout: "horizontal",
                    spacing: "xl",
                    contents: [{
                        type: "box", // quantity.
                        layout: "baseline",
                        contents: [{
                            type: "text",
                            text: `数量`,
                            color: "#999999",
                            size: "sm",
                            flex: 0
                        },{
                            type: "text",
                            text: `${String(o.quantity)}${await t.t("unit")}`,
                            size: "lg",
                            align: "end"
                        }]
                    },{
                        type: "separator"
                    },{
                        type: "box", // amount.
                        layout: "baseline",
                        contents: [{
                            type: "text",
                            text: `金額`,
                            color: "#999999",
                            size: "sm",
                            flex: 0
                        },{
                            type: "text",
                            text: `${String(o.amount)}${await t.t("yen")}`,
                            size: "lg",
                            align: "end"
                        }]
                    }]
                },{
                    type: "separator"
                }]
            },
            footer: {
                type: "box", // Contains cancel button
                layout: "vertical",
                contents: [{
                    type: "button",
                    style: "primary",
                    color: "#ff0000",
                    action: {
                        type: "message",
                        label: await t.t(`cancel`),
                        text: `${o.label}`
                    }
                }]
            }
        }

        return bubble;
    }

    /**
    Carousel message
    @method
    @param {String} bubble_type - internal method which is defined in this class
    @param {String} alt_text
    @param {Array.<options>}
    @return {Object} flex message object
    */
    async carousel_message(bubble_type, alt_text, option_list){
        let message = {
            type: "flex",
            altText: alt_text,
            contents: {
                type: "carousel",
                contents: []
            }
        }
        for (let option of option_list){
            message.contents.contents.push(await this[`${bubble_type}_bubble`](option));
            if (message.contents.contents.length == 10){
                debug(`Number of contents is now 10 so we omit rest of option list.`);
                break;
            }
        }

        return message;
    }

    test(message){
        const option = require(`../flex_test_data/${message}`);
        return JSON.stringify(ServiceFlex[message](option));
    }
}

module.exports = ServiceFlex;
