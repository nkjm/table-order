"use strict";

require("dotenv").config();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Emulator = require("../test-util/emulator");
const messenger_options = [{
    name: "line",
    options: {
        line_channel_secret: process.env.LINE_CHANNEL_SECRET
    }
}];
const user_id = "human-response";
chai.use(chaiAsPromised);
const should = chai.should();

const BOT_LANGUAGE = "ja";
const SENDER_LANGUAGE = "en";
const Translation = require("../translation/translation");
let t = new Translation(undefined, SENDER_LANGUAGE);

for (let messenger_option of messenger_options){
    let emu = new Emulator(messenger_option.name, messenger_option.options);

    describe(`Test ${user_id} from ` + emu.messenger_type, function(){

        describe("Don't make chatbot learn", function(){
            it("will just answer.", function(){
                this.timeout(15000);

                let answer = `Over there in 2nd floor.`;

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "human-response",
                        parameters: {
                            user: {
                                id: user_id,
                                language: SENDER_LANGUAGE
                            },
                            question: `Where is the restroom?`
                        }
                    },
                    language: BOT_LANGUAGE
                })});
                return emu.send(event).then(async function(context){
                    context.intent.name.should.equal("human-response");
                    context.sender_language.should.equal(BOT_LANGUAGE);
                    context.confirming.should.equal("answer");
                    let event = emu.create_message_event(user_id, answer);
                    return emu.send(event);
                }).then(async function(context){
                    context.confirming.should.equal("enable_learning");
                    let event = emu.create_message_event(user_id, `いいえ`);
                    return emu.send(event);
                }).then(async function(context){
                    should.not.exist(context.confirming);
                    context.previous.message[0].message.text.should.equal(answer);
                })
            })
        })
    })
}
