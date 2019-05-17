"use strict";

const debug = require("debug")("bot-express:message")
const Message = require("./message");

module.exports = class MessageAfterPay extends Message {
    constructor(translator){
        super(translator);
    }


    /**
     * @method
     * @async
     * @param {Object} options
     * @param {Object} options.order
     */
    async receipt(options){
        const o = options;
        const order = o.order;

        let total_amount = 0;
        let order_item_contents = [];
        for (let i of order.item_list){
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
            altText: await this.t.t(`receipt`),
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{
                        type: "text",
                        text: await this.t.t(`order_id`),
                        align: "center",
                        size: "sm",
                        weight: "bold"
                    },{
                        type: "text",
                        text: String(Math.floor(Math.random() * (9999 - 1000)) + 1000), // order.id.split("-")[1],
                        align: "center",
                        size: "4xl",
                        weight: "bold"
                    },{
                        type: "separator"
                    },{
                        type: "text",
                        text: await this.t.t(`receipt`),
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
                    },{
                        type: "separator"
                    },{
                        type: "text",
                        text: await this.t.t(`let_you_know_when_food_is_ready`),
                        wrap: true
                    }]
                }
            }
        } // End of message

        debug(JSON.stringify(message));

        return message;
    }
}