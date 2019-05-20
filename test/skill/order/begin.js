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

const emu = new Emulator(messenger_option.name, messenger_option.options);

describe("Test begin of order skill", async function(){
    beforeEach(async () => {
        await emu.clear_context(user_id);
    })

    describe("If sender lang is ja,", async function(){
        it("retrieves menu in ja.", async function(){
            let event;
            let context;
            event = emu.create_postback_event(user_id, {data: JSON.stringify({
                _type: "intent",
                intent: {
                    name: "order"
                },
                language: "ja"
            })});

            context = await emu.send(event);

            context.intent.name.should.equal("order");
            context.confirming.should.equal("label");
            context.global.menu_list.should.have.lengthOf(3);
            context.global.menu_list[0].label.should.equal("カオマンガイ");
        })
    })

    describe("If sender lang is en,", async function(){
        it("retrieves menu in en.", async function(){
            let event;
            let context;
            event = emu.create_postback_event(user_id, {data: JSON.stringify({
                _type: "intent",
                intent: {
                    name: "order"
                },
                language: "en"
            })});

            context = await emu.send(event);

            context.intent.name.should.equal("order");
            context.confirming.should.equal("label");
            context.global.menu_list.should.have.lengthOf(3);
            context.global.menu_list[0].label.should.equal("Khao Man Kai");
        })
    })
})