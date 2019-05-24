"use strict";

const debug = require("debug")("bot-express:message");
const Message = require("./message.js");

module.exports = class MessageFaqIsHot extends Message {
    constructor(translation){
        super(translation);
    }
}
