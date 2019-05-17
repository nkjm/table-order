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

describe("Test order_item_list of order skill", async function(){
    beforeEach(async () => {
        await emu.clear_context(user_id);
    })

    describe("If remove button tapped,", async function(){
        it("provide list of ordered item list.", async function(){
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

            context = await emu.send(emu.create_postback_event(user_id, {data: JSON.stringify({
                type: "process_parameters",
                parameters: {
                    label: "Pad Thai",
                    quantity: 1
                }
            })}));

            context.confirming.should.equal("review_order_item_list");

            context = await emu.send(emu.create_message_event(user_id, await t.t("add")));

            context.confirming.should.equal("label");

            context = await emu.send(emu.create_postback_event(user_id, {data: JSON.stringify({
                type: "process_parameters",
                parameters: {
                    label: "Tom Yam Goon",
                    quantity: 2
                }
            })}));

            context.confirming.should.equal("review_order_item_list");

            context = await emu.send(emu.create_message_event(user_id, await t.t("add")));

            context.confirming.should.equal("label");

            context = await emu.send(emu.create_postback_event(user_id, {data: JSON.stringify({
                type: "process_parameters",
                parameters: {
                    label: "Khao Man Kai",
                    quantity: 3
                }
            })}));

            context.confirming.should.equal("review_order_item_list");
            context.confirmed.order_item_list.should.have.lengthOf(3);

            context = await emu.send(emu.create_message_event(user_id, await t.t("remove")));

            context.confirming.should.equal("order_item_to_remove");

            context = await emu.send(emu.create_message_event(user_id, "Pad Thai"));

            context.confirming.should.equal("review_order_item_list");
            context.confirmed.order_item_list.should.have.lengthOf(2);
            context.confirmed.order_item_list[0].label.should.equal("Khao Man Kai");
            context.confirmed.order_item_list[0].quantity.should.equal(3);
            context.confirmed.order_item_list[1].label.should.equal("Tom Yam Goon");
            context.confirmed.order_item_list[1].quantity.should.equal(2);

            context = await emu.send(emu.create_message_event(user_id, await t.t("remove")));

            context.confirming.should.equal("order_item_to_remove");

            context = await emu.send(emu.create_message_event(user_id, "Khao Man Kai"));

            context.confirming.should.equal("review_order_item_list");
            context.confirmed.order_item_list.should.have.lengthOf(1);
            context.confirmed.order_item_list[0].label.should.equal("Tom Yam Goon");
            context.confirmed.order_item_list[0].quantity.should.equal(2);
        })
    })
})