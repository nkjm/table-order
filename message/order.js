"use strict";

const Message = require("./message");
const debug = require("debug")("bot-express:message");

module.exports = class MessageOrder extends Message {
    constructor(translation){
        super(translation);
    }

    /**
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.message_text
     * @param {Array.<Object>} options.order_item_list
     * @return {FlexMessage}
     */
    async order_item_to_remove(options){
        const o = options;

        const bubble_list = [];
        for (const order_item of o.order_item_list){
            bubble_list.push(await this.order_item_to_remove_bubble({
                order_item:order_item 
            }));
        }

        const message = await super.carousel({
            message_text: o.message_text,
            bubble_list: bubble_list
        })

        debug(JSON.stringify(message));

        return message;

    }

    /**
     * @method
     * @async
     * @param {Object} options
     * @param {Object} options.order_item
     * @return {FlexBubble}
     */
    async order_item_to_remove_bubble(options){
        const o = options.order_item;

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
                            text: await this.t.t(`quantity`),
                            color: "#999999",
                            size: "xs",
                            flex: 0
                        },{
                            type: "text",
                            text: `${String(o.quantity)}${await this.t.t("unit")}`,
                            size: "md",
                            align: "end"
                        }]
                    },{
                        type: "separator"
                    },{
                        type: "box", // amount.
                        layout: "baseline",
                        contents: [{
                            type: "text",
                            text: await this.t.t(`amount`),
                            color: "#999999",
                            size: "xs",
                            flex: 0
                        },{
                            type: "text",
                            text: `${String(o.amount)}${await this.t.t("yen")}`,
                            size: "md",
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
                    height: "sm",
                    action: {
                        type: "message",
                        label: await this.t.t(`remove`),
                        text: `${o.label}`
                    }
                }]
            }
        }

        return bubble;
    }

    /**
     * @method
     * @async
     * @param {Array.<order_item>} order_item_list
     * @return {FlexMessageObject}
     */
    async review_order_item_list(order_item_list){
        let total_amount = 0;
        let order_item_contents = [];
        for (let i of order_item_list){
            order_item_contents.push({
                type: "box",
                layout: "baseline",
                contents: [{
                    type: "text",
                    text: `${i.label}（${String(i.quantity)}${await this.t.t("unit")}）`,
                    size: "xs",
                    color: "#666666",
                    wrap: true
                },{
                    type: "text",
                    text: `${String(i.amount)}${await this.t.t("yen")}`,
                    size: "md",
                    align: "end",
                    flex: 0
                }]
            })
            total_amount += i.amount;
        }

        let message = {
            type: "flex",
            altText: await this.t.t(`is_the_order_correct`),
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{
                        type: "text",
                        text: await this.t.t(`is_the_order_correct`),
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
                            text: await this.t.t(`total_amount`),
                            size: "md",
                            color: "#000000",
                            wrap: true,
                            flex: 0
                        },{
                            type: "text",
                            text: `${String(total_amount)}${await this.t.t("yen")}`,
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
                        type: "box",
                        layout: "horizontal",
                        spacing: "md",
                        contents: [{
                            type: "button",
                            style: "secondary",
                            height: "sm",
                            action: {
                                type: "message",
                                label: await this.t.t(`remove`),
                                text: await this.t.t(`remove`)
                            }
                        },{
                            type: "button",
                            style: "secondary",
                            height: "sm",
                            action: {
                                type: "message",
                                label: await this.t.t(`add`),
                                text: await this.t.t(`add`)
                            }
                        }]
                    },{
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "message",
                            label: await this.t.t(`check`),
                            text: await this.t.t(`check`)
                        }
                    }]
                }
            }
        }

        return message;
    }

    /**
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.message_text
     * @param {Array.<Object>} options.menu_list
     * @return {Object}
     */
    async order_item(options){
        const o = options;

        const bubble_list = [];
        for (const menu of o.menu_list){
            bubble_list.push(await this.menu_bubble({
                menu: menu
            }));
        }

        const message = await super.carousel({
            message_text: o.message_text,
            bubble_list: bubble_list
        })

        debug(JSON.stringify(message));

        return message;
    }

    /**    
     * @method
     * @async
     * @param {Object} options
     * @param {Object} options.menu
     * @param {String} options.menu.label
     * @param {String} options.menu.image
     * @param {Number} options.menu.price
     */
    async menu_bubble(options){
        const o = options;
        const m = o.menu;
        
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
                    label: `${String(i)}${await this.t.t("unit")}`,
                    displayText: await this.t.t(`x_item`, {
                        item_label: m.label,
                        number: i
                    }),
                    data: JSON.stringify({
                        type: "process_parameters",
                        parameters: {
                            label: m.label,
                            quantity: i
                        }
                    })
                }
            })
        }

        let bubble = {
            type: "bubble",
            hero: {
                type: "image",
                url: m.image,
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
                    text: m.label,
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
                            text: await this.t.t(`amount`),
                            color: "#999999",
                            size: "sm",
                            flex: 0
                        },{
                            type: "text",
                            text: `${String(m.price)}${await this.t.t("yen")}`,
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
                        label: await this.t.t(`more_than_x_unit`, {
                            number: quantity_threshold + 1
                        }),
                        displayText: await this.t.t(`more_than_x_item`, {
                            item_label: m.label,
                            number: quantity_threshold + 1
                        }),
                        data: JSON.stringify({
                            type: "process_parameters",
                            parameters: {
                                label: m.label
                            }
                        })
                    }
                }]
            }
        }

        debug(JSON.stringify(bubble));

        return bubble;
    }
}