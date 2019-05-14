"use strict";

require("dotenv").config();

const debug = require("debug")("bot-express:service");
const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.GOOGLE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    }),
    databaseURL: `https://${process.env.GOOGLE_PROJECT_ID}.firebaseio.com`,
    storageBucket: `${process.env.GOOGLE_PROJECT_ID}.appspot.com`,
    projectId: process.env.GOOGLE_PROJECT_ID
});
const db = admin.firestore();
db.settings({
    timestampsInSnapshots: true
});

class ServiceRestaurantFirestore {
    /**
     * @constructor
     */
    constructor(){
        this.client = db;
    }

    /**
     * Get restaurant.
     * @param {String} restaurante_id 
     * @return {Object} restaurant
     */
    async get(restaurante_id){
        let doc = await db.collection("restaurants").doc(restaurante_id).get();
        if (doc.exists){
            return doc.data();
        } else {
            return null;
        }
    }

    /**
     * Get restaurant list
     * @return {Array.<restaurant>}
     */
    async list(){
        let restaurante_list = [];
        let doc_list = await db.collection('restaurants').get();
        doc_list.forEach(doc => {
            restaurante_list.push(doc.data());
        })
        return restaurante_list;
    }

    /**
     * Get order.
     * @param {String} restaurante_id 
     * @param {String} order_id 
     */
    async get_order(restaurante_id, order_id){
        let doc = await db.collection('restaurants').doc(restaurante_id).collection("orders").doc(order_id).get();
        if (doc.exists){
            const order = doc.date();
            order.id = order_id;
            return order;
        } else {
            return null;
        }
    }

    /**
     * Save order.
     * @param {String} restaurante_id 
     * @param {order} order 
     */
    async save_order(restaurante_id, order){
        // return db.collection("restaurants").doc(restaurante_id).collection("orders").doc(order_id).set(order);

        let doc_ref = await this.db.collection("restaurants").doc(restaurante_id).collection("orders").add(order);
        if (!(doc_ref && doc_ref.id)){
            throw new Error("Failed to save data to firestore.");
        }
        return doc_ref.id;
    }

    /**
     * Update order.
     * @param {String} restaurante_id 
     * @param {String} order_id 
     * @param {order} order 
     */
    async update_order(restaurante_id, order_id, order){
        return db.collection("restaurants").doc(restaurante_id).collection("orders").doc(order_id).update(order);
    }

    /**
     * Save order.
     * @param {String} restaurante_id 
     * @param {String} order_id 
     */
    async cancel_order(restaurante_id, order_id){
        return db.collection("restaurants").doc(restaurante_id).collection("orders").doc(order_id).delete();
    }
}

module.exports = new ServiceRestaurantFirestore();