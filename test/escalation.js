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
const user_id = "escalation";
chai.use(chaiAsPromised);
const should = chai.should();

const BOT_LANGUAGE = "ja";
const SENDER_LANGUAGE = "ja";
const Translation = require("../translation/translation");
let t = new Translation(undefined, SENDER_LANGUAGE);

for (let messenger_option of messenger_options){
    let emu = new Emulator(messenger_option.name, messenger_option.options);

    describe(`Test ${user_id} from ` + emu.messenger_type, function(){

        describe("Unknown question", function(){
            it("will trigger escalation skill", function(){
                this.timeout(15000);

                const question = `トイレはどこですか？`;
                let event = emu.create_message_event(user_id, question);
                return emu.send(event).then(async function(context){
                    context.intent.name.should.equal("input.unknown");
                    context.sender_language.should.equal(SENDER_LANGUAGE);
                    context.previous.message[0].message.altText.should.equal(await t.t(`no_idea_about_the_message_from_x`, {
                        sender_name: "Kazuki Nakajima"
                    }));
                    context.previous.message[0].message.contents.body.contents[0].text.should.equal(await t.t(`no_idea_about_the_message_from_x`, {
                        sender_name: "Kazuki Nakajima"
                    }));
                    context.previous.message[0].message.contents.body.contents[2].text.should.equal(question);
                    context.previous.message[0].message.contents.footer.contents[0].action.label.should.equal(await t.t(`answer`));
                    context.previous.message[0].message.contents.footer.contents[0].action.displayText.should.equal(await t.t(`answer`));
                    JSON.parse(context.previous.message[0].message.contents.footer.contents[0].action.data).intent.parameters.user.id.should.equal(user_id);
                    JSON.parse(context.previous.message[0].message.contents.footer.contents[0].action.data).intent.parameters.user.language.should.equal(SENDER_LANGUAGE);
                    JSON.parse(context.previous.message[0].message.contents.footer.contents[0].action.data).intent.parameters.question.should.equal(question);
                    JSON.parse(context.previous.message[0].message.contents.footer.contents[0].action.data).language.should.equal(BOT_LANGUAGE);
                });
            })
        })

    })
}
