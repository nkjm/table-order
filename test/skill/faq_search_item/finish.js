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

describe("Test faq_search_item", async function(){
    beforeEach(async () => {
        await emu.clear_context(user_id);
    })

    describe("If item found,", async function(){
        it("answer yes.", async function(){
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

            context = await emu.send(emu.create_message_event(user_id, "Do you have pad thai?"));

            context.previous.message[0].message.text.should.equal(await t.t("yes_we_have_x", { item_label: "Pad Thai" }))
            context.intent.name.should.equal("order");
            context.confirming.should.equal("label");

            context = await emu.send(emu.create_message_event(user_id, "Pad Thai"));

            context.confirming.should.equal("quantity");
        })
    })

    describe.only("If item not found,", async function(){
        it("answer no.", async function(){
            let context;

            context = await emu.send(emu.create_postback_event(user_id, {data: JSON.stringify({
                type: "intent",
                intent: {
                    name: "faq_search_item"
                },
                language: SENDER_LANGUAGE
            })}));

            context.intent.name.should.equal("faq_search_item");
            context.confirming.should.equal("item_label");

            context = await emu.send(emu.create_message_event(user_id, "iPad"));

            context.previous.message[0].message.text.should.equal(await t.t("sorry_we_do_not_have_x", { item_label: "iPad" }))
        })
    })
})