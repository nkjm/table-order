"use strict";

const Message = require("./message");

module.exports = class MessageSelectPaymentMethod extends Message {
    constructor(translator){
        super(translator);
    }
}