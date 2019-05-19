"use strict";

const debug = require("debug")("bot-express:message")
const Message = require("./message");

module.exports = class MessageNotifyOrderReady extends Message {
    constructor(translator){
        super(translator);
    }

    /**
     * @method
     * @async
     * @param {options} options
     * @param {order} options.order 
     * @return {FlexMessageObject}
     */
    async order_ready(options){
        const order = options.order;

        let message = {
            type: "flex",
            altText: await this.t.t("your_order_is_ready"),
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{
                        type: "text",
                        text: await this.t.t(`reference_number`),
                        align: "center",
                        size: "sm",
                        weight: "bold"
                    },{
                        type: "text",
                        text: order.reference_number,
                        align: "center",
                        size: "4xl",
                        weight: "bold"
                    },{
                        type: "separator"
                    },{
                        type: "text",
                        text: await this.t.t("your_order_is_ready"),
                        wrap: true
                    }]
                }
            }
        } // End of message

        debug(JSON.stringify(message));

        return message;
    }
}