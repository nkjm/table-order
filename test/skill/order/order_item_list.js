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

    describe("If there is no duplicate,", async function(){
        it("save all in context.", async function(){
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
            context.confirmed.order_item_list.should.have.lengthOf(2);
            context.confirmed.order_item_list[0].label.should.equal("Tom Yam Goon");
            context.confirmed.order_item_list[0].quantity.should.equal(2);
            context.confirmed.order_item_list[0].amount.should.equal(context.confirmed.menu_list.find(menu => menu.label === "Tom Yam Goon").price * 2);
            context.confirmed.order_item_list[1].label.should.equal("Pad Thai");
            context.confirmed.order_item_list[1].quantity.should.equal(1);
        })
    })

    describe("If there is duplicate,", async function(){
        it("merge order item and increment quantity", async function(){
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
            context.confirmed.order_item_list.should.have.lengthOf(2);
            context.confirmed.order_item_list[0].label.should.equal("Pad Thai");
            context.confirmed.order_item_list[0].quantity.should.equal(3);
            context.confirmed.order_item_list[0].amount.should.equal(context.confirmed.menu_list.find(menu => menu.label === "Pad Thai").price * 3);
            context.confirmed.order_item_list[1].label.should.equal("Tom Yam Goon");
            context.confirmed.order_item_list[1].quantity.should.equal(2);
        })
    })
})