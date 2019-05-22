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

describe("Test faq_is_hot skill", async function(){
    beforeEach(async () => {
        await emu.clear_context(user_id);
    })

    describe("If it is launched as sub skill and menu has the item,", async function(){
        it("provides answer and get back to parent skill.", async function(){
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

            context = await emu.send(emu.create_message_event(user_id, "How hot is Pad Thai?"));

            context.previous.message[0].message.text.should.equal(await t.t("x_is_moderately_hot", { item_label: "Pad Thai" }))
            context.intent.name.should.equal("order");
            context.confirming.should.equal("label");
        })
    })
})