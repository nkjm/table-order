"use strict";

require("dotenv").config();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Emulator = require("../../../test-util/emulator");
const messenger_option = {
    name: "line",
    options: {
        line_channel_secret: process.env.LINE_BOT_CHANNEL_SECRET
    }
};
const user_id = "order";
chai.use(chaiAsPromised);
const should = chai.should();
const SENDER_LANGUAGE = "en";

const emu = new Emulator(messenger_option.name, messenger_option.options);

const Translation = require("../../../translation/translation");
const t = new Translation(undefined, SENDER_LANGUAGE);

describe("Test faq_is_recommendation", async function(){
    beforeEach(async () => {
        await emu.clear_context(user_id);
    })

    describe("If ingredient found,", async function(){
        it("provides recommendation.", async function(){
            let context;

            context = await emu.send(emu.create_postback_event(user_id, {data: JSON.stringify({
                type: "intent",
                intent: {
                    name: "order"
                },
                language: SENDER_LANGUAGE
            })}));

            context.intent.name.should.equal("order");
            context.confirming.should.equal("label");

            context = await emu.send(emu.create_message_event(user_id, "What is your recommendation?"));

            context.intent.name.should.equal("faq_recommendation");
            context.confirming.should.equal("ingredient");

            context = await emu.send(emu.create_message_event(user_id, "Sea food"));

            context.previous.message[0].message.text.should.equal(await t.t("our_recommendation_is_x", { item_label: "Tom Yam Goon" }))
            context.intent.name.should.equal("order");
            context.confirming.should.equal("label");

            context = await emu.send(emu.create_message_event(user_id, "Pad Thai"));

            context.confirming.should.equal("quantity");
        })
    })

    describe("If ingredient not found,", async function(){
        it("sorry.", async function(){
            let context;

            context = await emu.send(emu.create_postback_event(user_id, {data: JSON.stringify({
                type: "intent",
                intent: {
                    name: "order"
                },
                language: SENDER_LANGUAGE
            })}));

            context.intent.name.should.equal("order");
            context.confirming.should.equal("label");

            context = await emu.send(emu.create_message_event(user_id, "What is your recommendation?"));

            context.intent.name.should.equal("faq_recommendation");
            context.confirming.should.equal("ingredient");

            context = await emu.send(emu.create_message_event(user_id, "Beef"));

            context.previous.message[0].message.text.should.equal(await t.t("sorry_we_have_no_recommendation_for_you"))
            context.intent.name.should.equal("order");
            context.confirming.should.equal("label");

            context = await emu.send(emu.create_message_event(user_id, "Pad Thai"));

            context.confirming.should.equal("quantity");
        })
    })
})