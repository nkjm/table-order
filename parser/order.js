"use strict";

const debug = require("debug")("bot-express:parser");

class ParserOrder {
    static async order_item(value, bot, event, context){
        if (typeof value == "string"){
            let menu = context.confirmed.restaurante.menu.find(menu => menu.label === value);
            if (menu){
                return {
                    label: menu.label,
                    image: menu.image,
                    unit_price: menu.price,
                    quantity: 0
                };
            } else {
                throw new Error("invalid_value");
            }
        } else if (typeof value == "object" && value.data){
            let order_item = JSON.parse(value.data);
            if (order_item.label){
                let menu = context.confirmed.restaurante.menu.find(menu => menu.label === order_item.label);
                if (menu){
                    if (order_item.quantity){
                        return {
                            label: menu.label,
                            image: menu.image,
                            unit_price: menu.price,
                            quantity: order_item.quantity
                        }
                    } else if (order_item.label && !order_item.quantity){
                        return {
                            label: menu.label,
                            image: menu.image,
                            unit_price: menu.price,
                            quantity: 0
                        }
                    }
                }
            }
        }

        throw new Error("invalid_value");
    }
}

module.exports = ParserOrder;
