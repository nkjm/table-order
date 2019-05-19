"use strict";

const debug = require("debug")("bot-express:message")
const Message = require("./message");

module.exports = class MessageHumanResponse extends Message {
    constructor(translator){
        super(translator);
    }
}