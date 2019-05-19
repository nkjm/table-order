"use strict";

const debug = require("debug")("bot-express:message")
const Message = require("./message");

module.exports = class MessageEscalation extends Message {
    constructor(translator){
        super(translator);
    }

    /**
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.sender_id
     * @param {String} options.sender_name
     * @param {String} options.sender_language
     * @param {String} options.bot_language
     * @param {String} options.message_text
     * @return {FlexMessageObject}
     */
    async escalation(options){
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
                                type: "intent",
                                intent: {
                                    name: "human_response",
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
}