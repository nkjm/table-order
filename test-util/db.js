"use strict";

require("dotenv").config();

const crypto = require("crypto");
const Promise = require("bluebird");
const firebase_admin = require("firebase-admin");
const ServiceDb = require("../service/db");
const SENDER_LANGUAGE = "en";
const memory_cache = require("memory-cache");

module.exports = class TestUtilDb extends ServiceDb {
    constructor(){
        super();
    }

    /**
     * @method
     * @async
     * @param {Object} options
     * @return {Object}
     */
    async create_user(options = {}){
        const user = {
            line_user_id: options.line_user_id || `dummy_${crypto.randomBytes(10).toString('hex')}`,
            line_display_name: options.line_display_name || "ボットエクスプレス",
            line_picture_url: options.line_picture_url || "https://www.bot-express.com",
            secret: options.secret || crypto.randomBytes(40).toString('hex'),
            created_at: options.created_at || new Date(),
            bot_express_test: true
        }
        await super.create("user", user, user.line_user_id);

        return user;
    }

    /**
     * @method
     * @async
     * @param {Object} options
     * @return {Object}
     */
    async create_order(options = {}){
        const o = options;
        const order = {
            // Common information.
            created_at: o.created_at || new Date(),
            line_user_id: o.line_user_id || `dummy_${crypto.randomBytes(10).toString('hex')}`,
            language: o.language || SENDER_LANGUAGE,
            bot_express_test: true,
            // Following is workshop specific information.
            order_item_list: o.order_item_list || [{
                label: "Pad Thai",
                quantity: 2,
                unit_price: 550,
                amount: 1100,
                image: `https://firebasestorage.googleapis.com/v0/b/foodtimes-b4f8d.appspot.com/o/menu%2Fpad-thai.jpg?alt=media&token=0437ad83-ace3-409c-bf64-45f209c5f52a`
            }]
        }
        order.id = await super.create("order", order);

        return order;
    }


    /**
     * Clear user test data.
     * @method
     * @async
     */
    async clear_user(){
        return this.clear("user");
    }

    /**
     * Clear order test data.
     * @method
     * @async
     */
    async clear_order(){
        return this.clear("order");
    }

    /**
     * @method
     * @async
     */
    async clear(collection){
        const query_snapshot = await this.firestore.collection(collection).where("bot_express_test", "==", true).get();
        let cleared = [];
        query_snapshot.forEach(async doc => {
            cleared.push(super.delete(collection, doc.id));
        })
        return Promise.all(cleared);
    }
}
