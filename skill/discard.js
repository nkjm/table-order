"use strict";

const debug = require("debug")("bot-express:skill");
const SkillRobotResponse = require("./robot_response");

module.exports = class SkillDiscard extends SkillRobotResponse {
    constructor(){
        super();
    }
}
