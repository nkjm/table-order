"use strict";

const debug = require("debug")("bot-express:service");
const store_type = process.env.RESTAURANTE_STORE_TYPE || "firestore";
const store = require(`./restaurante/${store_type}.js`);
const crypto = require("crypto");

class ServiceRestaurante {
    /**
     * @typedef {Object} restaurante
     * @prop {String} id
     * @prop {Object} label
     * @prop {Object} menu
     * @prop {Array.<String>} owner_email
     * @prop {Object} line_pay
     * @prop {String} line_pay.channel_id - Encrypted
     * @prop {String} line_pay.channel_secret - Encrypted
     */

    /**
     * @typedef {Object} order
     * @prop {String} id
     * @prop {String} transaction_id
     * @prop {Number} reserved_at
     * @prop {Number} paid_at
     * @prop {Number} served_at
     * @prop {String} status - reserved | paid | served
     * @prop {String} line_user_id
     * @prop {String} language
     * @prop {Array.<order_item>} item_list
     * @prop {Number} amount
     * @prop {String} currency
     * @prop {restaurante} restaurante
     */

    /**
     * Translate and decrypt restaurante
     * @method 
     * @param {restaurante} restaurante
     * @param {String} lang
     */
    static translate_restaurante(restaurante, lang){
        let r = restaurante;
        let translated_r = JSON.parse(JSON.stringify(r));

        // Translate label of restaurante
        if (r.label[lang]){
            // If corresponding translation found, we use it.
            translated_r.label = r.label[lang];
        } else {
            // If corresponding translation not found, we use first translation.
            translated_r.label = r.label[Object.keys(r.label)[0]];
        }

        // Translate label of menu
        let i = 0;
        for (let menu of r.menu){
            if (menu.label[lang]){
                translated_r.menu[i].label = menu.label[lang];
            } else {
                translated_r.menu[i].label = menu.label[Object.keys(menu.label)[0]];
            }
            i++;
        }

        // Decryption.
        if (r.line_pay){
            if (r.line_pay.channel_id){
                let decipher = crypto.createDecipher("aes192", process.env.FIREBASE_ENCRYPTION_KEY);
                translated_r.line_pay.channel_id = decipher.update(r.line_pay.channel_id, "hex", "utf8");
                translated_r.line_pay.channel_id += decipher.final("utf8");
            }
            if (r.line_pay.channel_secret){
                let decipher = crypto.createDecipher("aes192", process.env.FIREBASE_ENCRYPTION_KEY);
                translated_r.line_pay.channel_secret = decipher.update(r.line_pay.channel_secret, "hex", "utf8");
                translated_r.line_pay.channel_secret += decipher.final("utf8");
            }
        }
        
        return translated_r;
    }

    /**
     * Get restaurante list.
     * @method
     * @param {String} [lang="ja"]
     * @return {Array.<restauranter>}
     */
    static async list(lang = "ja"){
        let restaurante_list = await store.list();
        let translated_restaurante_list = [];

        for (let r of restaurante_list){
            translated_restaurante_list.push(ServiceRestaurante.translate_restaurante(r, lang));
        }

        return translated_restaurante_list;
    }

    /**
     * Get restaurante.
     * @method
     * @param {String} restaurante_id
     * @param {String} [lang="ja"]
     * @return {restaurante}
     */
    static async get(restaurante_id, lang = "ja"){
        let restaurante = await store.get(restaurante_id);

        let translated_restaurante = ServiceRestaurante.translate_restaurante(restaurante, lang);

        return translated_restaurante;
    }

    /**
     * Get order.
     * @method
     * @param {String} restaurante_id
     * @param {String} order_id
     * @return {order}
     */
    static async get_order(restaurante_id, order_id){
        return store.get_order(restaurante_id, order_id);
    }

    /**
     * Save order.
     * @method
     * @param {String} restaurante_id
     * @param {order} order
     */
    static async save_order(restaurante_id, order){
        return store.save_order(restaurante_id, order)
    }

    /**
     * Update order.
     * @method
     * @param {String} restaurante_id
     * @param {String} order_id
     * @param {order} order
     */
    static async update_order(restaurante_id, order_id, order){
        return store.update_order(restaurante_id, order_id, order)
    }

    /**
     * Cancel order.
     * @method
     * @param {String} restaurante_id
     * @param {String} order_id
     */
    static async cancel_order(restaurante_id, order_id){
        return store.cancel_order(restaurante_id, order_id);
    }
}

module.exports = ServiceRestaurante;