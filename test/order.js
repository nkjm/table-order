"use strict";

require("dotenv").config();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Emulator = require("../test-util/emulator");
const messenger_option = {
    name: "line",
    options: {
        line_channel_secret: process.env.LINE_CHANNEL_SECRET
    }
};
const user_id = "dummy_user_id";
chai.use(chaiAsPromised);
const should = chai.should();
const emu = new Emulator(messenger_option.name, messenger_option.options);

describe("Test order", async function(){
    describe("General order", async function(){
        it("will run through process", async function(){
            this.timeout(10000);

            await emu.clear_context(user_id);

            let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                _type: "intent",
                intent: {
                    name: "order"
                },
                language: "ja"
            })});
            let context = await emu.send(event);

            context.intent.name.should.equal("order");
            context.confirming.should.equal("restaurante");

            context = await emu.send(emu.create_message_event(user_id, "博多カレー研究所"));

            context.confirming.should.equal("order_item");
            event = emu.create_postback_event(user_id, {data: JSON.stringify({
                label: "博多あごだしカレー",
                quantity: 2
            })});

            context = await emu.send(event);

            context.confirming.should.equal("anything_else");
            
            context = await emu.send(emu.create_message_event(user_id, "追加"));

            context.confirming.should.equal("order_item");

            event = emu.create_postback_event(user_id, {data: JSON.stringify({
                label: "博多あごだし坦々カレー",
                quantity: 1
            })});
            context = await emu.send(event);

            context.confirming.should.equal("anything_else");
            context = await emu.send(emu.create_message_event(user_id, "以上"));

            context.confirming.should.equal("review");

            context = await emu.send(emu.create_message_event(user_id, "会計"));

            should.not.exist(context.confirming);
            context.confirmed.order_item_list.should.have.lengthOf(2);
            context.confirmed.order_item_list[1].label.should.equal("博多あごだしカレー");
            context.confirmed.order_item_list[1].quantity.should.equal(2);
            context.confirmed.order_item_list[1].amount.should.equal(1680);
            context.confirmed.order_item_list[0].label.should.equal("博多あごだし坦々カレー");
            context.confirmed.order_item_list[0].quantity.should.equal(1);
            context.confirmed.order_item_list[0].amount.should.equal(950);
        })
    })
})
