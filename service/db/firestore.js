"use strict";

const firebase_admin = require("firebase-admin");
const debug = require("debug")("bot-express:service");

module.exports = class ServiceDbFirestore {
    /**
     * @constructor
     */
    constructor(options){
        if (options.instance){
            this.db = options.instance;
            return;
        }

        // Check required options.
        const required_option_list = ["project_id", "client_email", "private_key"];
        for (let req_opt of required_option_list){
            if (options[req_opt] === undefined){
                throw new Error(`Required option "${req_opt}" for ServiceDbFirestore not set.`);
            }
        }

        firebase_admin.initializeApp({
            credential: firebase_admin.credential.cert({
                projectId: options.project_id,
                clientEmail: options.client_email,
                privateKey: options.private_key.replace(/\\n/g, "\n")
            }),
            databaseURL: `https://${options.project_id}.firebaseio.com`,
            storageBucket: `${options.project_id}.appspot.com`,
            projectId: options.project_id
        }, "asobuild");

        this.db = firebase_admin.firestore();
    }

    /**
     * Get item by item id.
     * @param {String} collection
     * @param {String} doc
     * @return {*}
     */
    async get(collection, doc){
        const doc_ref = await this.db.collection(collection).doc(doc).get();

        if (doc_ref.exists){
            return doc_ref.data();
        } else {
            return null;
        }
    }

    /**
     * List items.
     * @param {String} collection
     * @return {*}
     */
    async list(collection){
        const query_snapshot = await this.db.collection(collection).get();

        const item_list = [];
        query_snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            item_list.push(data);
        })
        return item_list;
    }

    /**
     * Create item.
     * @param {String} collection
     * @param {*} item 
     * @param {String} [doc]
     * @return {String} Item id.
     */
    async create(collection, item, doc){
        let doc_ref;
        if (doc){
            doc_ref = await this.db.collection(collection).doc(doc).set(item);
            return doc;
        } else {
            doc_ref = await this.db.collection(collection).add(item);
            if (!(doc_ref && doc_ref.id)){
                throw new Error("Failed to save data to firestore.");
            }
            return doc_ref.id;
        }
    }

    /**
     * Update item.
     * @param {String} collection
     * @param {*} item
     * @param {String} doc
     */
    async update(collection, item, doc){
        await this.db.collection(collection).doc(doc).update(item);
    }

    /**
     * Delete item.
     * @param {Stirng} collection
     * @param {String} doc
     */
    async delete(collection, doc){
        await this.db.collection(collection).doc(doc).delete();
    }
}