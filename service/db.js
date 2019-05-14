"use strict";

require("dotenv").config();

const required_option_list = ["type"];
const memory_cache = require("memory-cache");

module.exports = class ServiceDb {
    /**
     * @constructor
     */
    constructor(options = {}){
        options.type = options.type || "firestore";
        options.options = options.options || {
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY
        }

        // Check required options.
        for (let req_opt of required_option_list){
            if (options[req_opt] === undefined){
                throw new Error(`Required option "${req_opt}" for ServiceDb not set.`);
            }
        }

        // Check if db instance already exits.
        this.db = memory_cache.get(`ServiceDb_${options.type}`);
        if (!this.db){
            // Create new db instance.
            const Db = require(`./db/${options.type}.js`);
            this.db = new Db(options.options);

            // Save db instance to memory-cache.
            memory_cache.put(`ServiceDb_${options.type}`, this.db);
        }

        // Allow direct access to API provided by db implementation.
        this[options.type] = this.db.db;
    }

    /**
     * Create item.
     * @param {String} collection
     * @param {*} item
     * @param {String} [item_id]
     */
    async create(collection, item, item_id){
        return this.db.create(collection, item, item_id);
    }

    /**
     * Get item.
     * @param {String} collection
     * @param {String} item_id
     */
    async get(collection, item_id){
        return this.db.get(collection, item_id);
    }

    /**
     * List item.
     * @param {String} collection
     */
    async list(collection){
        return this.db.list(collection);
    }

    /**
     * Update item.
     * @param {String} collection
     * @param {*} item
     * @param {String} item_id
     */
    async update(collection, item, item_id){
        await this.db.update(collection, item, item_id);
    }

    /**
     * Delete item.
     * @param {String} collection
     * @param {String} item_id
     */
    async delete(collection, item_id){
        return this.db.delete(collection, item_id);
    }
}
