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

    describe("If remove button is tapped,", async function(){
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
            context.confirmed.order_item_list.should.have.lengthOf(1);

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

            context = await emu.send(emu.create_message_event(user_id, await t.t("remove")));

            context.confirming.should.equal("order_item_to_remove");
        })
    })

    describe("If check button is tapped", async function(){
        it("goes to select_payment", async function(){
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
            context.confirmed.order_item_list.should.have.lengthOf(1);

            context = await emu.send(emu.create_message_event(user_id, await t.t("add")));

            context.confirming.should.equal("label");

            context = await emu.send(emu.create_postback_event(user_id, {data: JSON.stringify({
                type: "process_parameters",
                parameters: {
                    label: "Tom Yam Goon",
                    quantity: 2
                }
            })}));

            context = await emu.send(emu.create_message_event(user_id, await t.t("add")));

            context.confirming.should.equal("label");

            context = await emu.send(emu.create_postback_event(user_id, {data: JSON.stringify({
                type: "process_parameters",
                parameters: {
                    label: "Pad Thai",
                    quantity: 2
                }
            })}));

            context.confirming.should.equal("review_order_item_list");

            context = await emu.send(emu.create_message_event(user_id, await t.t("check")));

            context.intent.name.should.equal("select_payment_method");
        })
    })

    describe.only("If remove button is tapped and there is no ordered item,", async function(){
        it("asks quit order or add item.", async function(){
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
            context.confirmed.order_item_list.should.have.lengthOf(1);

            context = await emu.send(emu.create_message_event(user_id, await t.t("remove")));

            context = await emu.send(emu.create_message_event(user_id, "Pad Thai"));

            context.confirming.should.equal("review_order_item_list");
            context.confirmed.order_item_list.should.have.lengthOf(0);

            context.previous.message[0].message.altText.should.equal(`${await t.t("there_is_no_order")} ${await t.t("do_you_add_order")}`);

            context = await emu.send(emu.create_message_event(user_id, await t.t("check")));
            context.confirming.should.equal("review_order_item_list");

            context = await emu.send(emu.create_message_event(user_id, await t.t("remove")));
            context.confirming.should.equal("review_order_item_list");

            context = await emu.send(emu.create_message_event(user_id, await t.t("quit")));
            should.not.exist(context.confirming);
        })
    })
})