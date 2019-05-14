"use strict";

const debug = require("debug")("bot-express:service");
const fs = require("fs");
const restaurante_data = fs.readFileSync("./data/restaurante.json");
const restaurante_list = JSON.parse(restaurante_data).restaurants;

/**
 * @deprecated
 */
module.exports = class ServiceRestauranteFile {
    static async list(lang = "ja"){
        let translated_restaurante_list = JSON.parse(JSON.stringify(restaurante_list));

        let i = 0;
        for (let r of restaurante_list){
            // Translate label of restaurante
            if (r.label[lang]){
                // If corresponding translation found, we use it.
                translated_restaurante_list[i].label = r.label[lang];
            } else {
                // If corresponding translation not found, we use first translation.
                translated_restaurante_list[i].label = r.label[Object.keys(r.label)[0]];
            }

            // Translate label of menu
            let ii = 0;
            for (let menu of restaurante_list[i].menu){
                if (menu.label[lang]){
                    translated_restaurante_list[i].menu[ii].label = menu.label[lang];
                } else {
                    translated_restaurante_list[i].menu[ii].label = menu.label[Object.keys(menu.label)[0]];
                }
                ii++;
            }

            i++;
        }
        debug(translated_restaurante_list);
        return translated_restaurante_list;
    }
}