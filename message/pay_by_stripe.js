"use strict";

const Message = require("./message");

module.exports = class MessagePayByStripe extends Message {
    constructor(translator){
        super(translator);
    }
}