"use strict";

const debug = require("debug")("bot-express:skill");

module.exports = class SkillClearContext {
    constructor(){
        this.clear_context_on_finish = true;
    }

    async finish(bot, event, context){
    }
}