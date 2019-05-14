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

describe("Test switch-restaurante skill", async function(){
    describe("First time.", async function(){
        it("will select restaurante and start order skill", async function(){
            this.timeout(10000);

            await emu.clear_context(user_id);

            let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                _type: "intent",
                intent: {
                    name: "switch-restaurante",
                    parameters: {
                        restaurante: "博多カレー研究所"
                    }
                },
                language: "ja"
            })});
            let context = await emu.send(event);

            context.intent.name.should.equal("order");
            context.confirming.should.equal("order_item");
            context.confirmed.restaurante.label.should.equal("博多カレー研究所");
        })
    })

    describe("Second time.", async function(){
        it("will change restaurante and start order skill", async function(){
            this.timeout(10000);

            await emu.clear_context(user_id);

            let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                _type: "intent",
                intent: {
                    name: "switch-restaurante",
                    parameters: {
                        restaurante: "博多カレー研究所"
                    }
                },
                language: "ja"
            })});
            let context = await emu.send(event);

            context.intent.name.should.equal("order");
            context.confirming.should.equal("order_item");
            context.confirmed.restaurante.label.should.equal("博多カレー研究所");

            event = emu.create_postback_event(user_id, {data: JSON.stringify({
                _type: "intent",
                intent: {
                    name: "switch-restaurante",
                    parameters: {
                        restaurante: "因幡うどん"
                    }
                },
                language: "ja"
            })});
            context = await emu.send(event);

            context.intent.name.should.equal("order");
            context.confirming.should.equal("order_item");
            context.confirmed.restaurante.label.should.equal("因幡うどん");
        })
    })
})
