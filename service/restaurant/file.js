"use strict";

const debug = require("debug")("bot-express:service");
const fs = require("fs");
const restaurant_data = fs.readFileSync("./data/restaurant.json");
const restaurant_list = JSON.parse(restaurant_data).restaurants;

/**
 * @deprecated
 */
module.exports = class ServiceRestaurantFile {
    static async list(lang = "ja"){
        let translated_restaurant_list = JSON.parse(JSON.stringify(restaurant_list));

        let i = 0;
        for (let r of restaurant_list){
            // Translate label of restaurant
            if (r.label[lang]){
                // If corresponding translation found, we use it.
                translated_restaurant_list[i].label = r.label[lang];
            } else {
                // If corresponding translation not found, we use first translation.
                translated_restaurant_list[i].label = r.label[Object.keys(r.label)[0]];
            }

            // Translate label of menu
            let ii = 0;
            for (let menu of restaurant_list[i].menu){
                if (menu.label[lang]){
                    translated_restaurant_list[i].menu[ii].label = menu.label[lang];
                } else {
                    translated_restaurant_list[i].menu[ii].label = menu.label[Object.keys(menu.label)[0]];
                }
                ii++;
            }

            i++;
        }
        debug(translated_restaurant_list);
        return translated_restaurant_list;
    }
}