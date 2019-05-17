"use strict";

require("dotenv").config();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const should = chai.should();

const Emulator = require("../../../test-util/emulator");
const emu = new Emulator("line", {
    line_channel_secret: process.env.LINE_BOT_CHANNEL_SECRET
});

const TestUtilDb = require("../../../test-util/db");
const db = new TestUtilDb();

const SENDER_LANGUAGE = "ja";

const Translation = require("../../../translation/translation");
const t = new Translation(undefined, SENDER_LANGUAGE);

describe("Test review_ticket_list of buy_ticket skill", async function(){
    let user;
    let order;

    before(async () => {
        user = await db.create_user();
        order = await db.create_order({
            line_user_id: user.line_user_id,
            status: "ordered"
        })
    })

    beforeEach(async () => {
        await emu.clear_context(user.line_user_id);
    })

    after(async () => {
        await db.clear_user();
        await db.clear_order();
    })

    describe("If user select credit card,", async function(){
        it("launched pay_by_stripe skill.", async function(){
            let context = await emu.send(emu.create_postback_event(user.line_user_id, {data: JSON.stringify({
                type: "intent",
                intent: {
                    name: "select_payment_method",
                    parameters: {
                        order_id: order.id,
                        name: "Food",
                        amount: 1300
                    }
                }
            })}));

            context.intent.name.should.equal("select_payment_method");
            context.confirming.should.equal("payment_method");

            context = await emu.send(emu.create_message_event(user.line_user_id, await t.t(`credit_card`)));

            context.intent.name.should.equal("pay_by_stripe");
        });
    });

    describe("If user select line pay,", async function(){
        it("launched pay_by_line_pay skill.", async function(){
            let context = await emu.send(emu.create_postback_event(user.line_user_id, {data: JSON.stringify({
                type: "intent",
                intent: {
                    name: "select_payment_method",
                    parameters: {
                        order_id: order.id,
                        name: "Food",
                        amount: 1300,
                    }
                }
            })}));

            context.intent.name.should.equal("select_payment_method");
            context.confirming.should.equal("payment_method");

            context = await emu.send(emu.create_message_event(user.line_user_id, await t.t(`line_pay`)));

            context.intent.name.should.equal("pay_by_line_pay");
        });
    });
});
