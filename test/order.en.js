"use strict";

require("dotenv").config();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Emulator = require("../test-util/emulator");
const messenger_options = [{
    name: "line",
    options: {
        line_channel_secret: process.env.LINE_CHANNEL_SECRET
    }
}];
const user_id = "order";
chai.use(chaiAsPromised);
const should = chai.should();


for (let messenger_option of messenger_options){
    let emu = new Emulator(messenger_option.name, messenger_option.options);

    describe("Test order from " + emu.messenger_type, function(){

        describe("General order", function(){
            it("will run through process", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    },
                    language: "en"
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "Okonomiyaki",
                        quantity: 2
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "Add");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "Beer",
                        quantity: 1
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "That's it");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "Check");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context.confirming);
                    context.confirmed.order_item_list.should.have.lengthOf(2);
                    context.confirmed.order_item_list[1].label.should.equal("Okonomiyaki");
                    context.confirmed.order_item_list[1].quantity.should.equal(2);
                    context.confirmed.order_item_list[1].amount.should.equal(1400);
                    context.confirmed.order_item_list[0].label.should.equal("Beer");
                    context.confirmed.order_item_list[0].quantity.should.equal(1);
                    context.confirmed.order_item_list[0].amount.should.equal(500);
                })
            })
        })

        /*
        describe("Order without quantity", function(){
            it("will ask quantity.", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    }
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_message_event(user_id, "豚玉");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("quantity");
                    let event = emu.create_message_event(user_id, "2");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "以上");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "会計");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context.confirming);
                    context.confirmed.order_item_list.should.have.lengthOf(1);
                    context.confirmed.order_item_list[0].label.should.equal("豚玉");
                    context.confirmed.order_item_list[0].quantity.should.equal(2);
                    context.confirmed.order_item_list[0].amount.should.equal(1400);
                })
            })
        })

        describe("Order without quantity in postback", function(){
            it("will ask quantity.", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    }
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉"
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("quantity");
                    let event = emu.create_message_event(user_id, "2");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "以上");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "会計");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context.confirming);
                    context.confirmed.order_item_list.should.have.lengthOf(1);
                    context.confirmed.order_item_list[0].label.should.equal("豚玉");
                    context.confirmed.order_item_list[0].quantity.should.equal(2);
                    context.confirmed.order_item_list[0].amount.should.equal(1400);
                })
            })
        })

        describe("Cancel order item.", function(){
            it("will remove it from order_item_list", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    }
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉",
                        quantity: 2
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "まだある");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "生ビール",
                        quantity: 1
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "以上");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "訂正");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("order_item_to_cancel");
                    let event = emu.create_message_event(user_id, "豚玉");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "会計");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context.confirming);
                    context.confirmed.order_item_list.should.have.lengthOf(1);
                    context.confirmed.order_item_list[0].label.should.equal("生ビール");
                })
            })
        })

        describe("Cancel order item and nothing left so cancel.", function(){
            it("will ask whether user wants to add or cancel order. And cancel order.", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    }
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉",
                        quantity: 2
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "以上");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "訂正");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("order_item_to_cancel");
                    let event = emu.create_message_event(user_id, "豚玉");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "キャンセル");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context);
                })
            })
        })

        describe("Cancel order item and nothing left and add item.", function(){
            it("will ask whether user wants to add or cancel order and show menu.", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    }
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉",
                        quantity: 2
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "以上");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "訂正");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("order_item_to_cancel");
                    let event = emu.create_message_event(user_id, "豚玉");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "追加");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉モダン焼き",
                        quantity: 1
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "会計");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context.confirming);
                    context.confirmed.order_item_list.should.have.lengthOf(1);
                    context.confirmed.order_item_list[0].label.should.equal("豚玉モダン焼き");
                })
            })
        })

        describe("Add order item.", function(){
            it("will add it to order_item_list", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    }
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉",
                        quantity: 2
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "まだある");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "生ビール",
                        quantity: 1
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "以上");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "追加");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉モダン焼き",
                        quantity: 1
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "会計");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context.confirming);
                    context.confirmed.order_item_list.should.have.lengthOf(3);
                    context.confirmed.order_item_list[0].label.should.equal("豚玉モダン焼き");
                })
            })
        })

        describe("Add order item when asked anything else.", function(){
            it("will add it to order_item_list", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    }
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉",
                        quantity: 2
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "生ビール",
                        quantity: 2
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "以上");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "会計");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context.confirming);
                    context.confirmed.order_item_list.should.have.lengthOf(2);
                    context.confirmed.order_item_list[0].label.should.equal("生ビール");
                })
            })
        })

        describe("Order the food already in order item list with quantity.", function(){
            it("will increment quantity.", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    }
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉",
                        quantity: 2
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉",
                        quantity: 1
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "以上");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "会計");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context.confirming);
                    context.confirmed.order_item_list.should.have.lengthOf(1);
                    context.confirmed.order_item_list[0].label.should.equal("豚玉");
                    context.confirmed.order_item_list[0].quantity.should.equal(3);
                    context.confirmed.order_item_list[0].amount.should.equal(2100);
                })
            })
        })

        describe("Order the food already in order item list without quantity.", function(){
            it("will increment quantity.", function(){
                this.timeout(60000);

                let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                    _type: "intent",
                    intent: {
                        name: "order"
                    }
                })});
                return emu.send(event).then(function(context){
                    context.intent.name.should.equal("order");
                    context.confirming.should.equal("order_item");
                    let event = emu.create_postback_event(user_id, {data: JSON.stringify({
                        label: "豚玉",
                        quantity: 2
                    })});
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "豚玉");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("quantity");
                    let event = emu.create_message_event(user_id, "1");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("anything_else");
                    let event = emu.create_message_event(user_id, "以上");
                    return emu.send(event);
                }).then(function(context){
                    context.confirming.should.equal("review");
                    let event = emu.create_message_event(user_id, "会計");
                    return emu.send(event);
                }).then(function(context){
                    should.not.exist(context.confirming);
                    context.confirmed.order_item_list.should.have.lengthOf(1);
                    context.confirmed.order_item_list[0].label.should.equal("豚玉");
                    context.confirmed.order_item_list[0].quantity.should.equal(3);
                    context.confirmed.order_item_list[0].amount.should.equal(2100);
                })
            })
        })
        */

    })
}
