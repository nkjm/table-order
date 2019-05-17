"use strict";

/**
 * Currently not used.
 */

require("dotenv").config();

const debug = require("debug")("bot-express:service");
const crypto = require("crypto");
const required_option_list = ["type"];
const prefix_cache = `service_cache_`;
const memory_cache = require("memory-cache");

/**
 * Contains method to operate cache which has lifetime.
 * @class
 */
module.exports = class ServiceCache {
    /**
     * @constructor
     */
    constructor(){
        const options = {
            type: "redis",
            url: process.env.REDIS_URL,
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD
        }

        // Check required options.
        for (let req_opt of required_option_list){
            if (options[req_opt] === undefined){
                throw new Error(`Required option "${req_opt}" for ServiceCache not set.`);
            }
        }

        // Check if cache instance already exits.
        this.c = memory_cache.get(`ServiceCache_${options.type}`);
        if (!this.c){
            // Create new cache instance.
            const Cache = require(`./cache/${options.type}.js`);
            this.c = new Cache(options);

            // Save db instance to memory-cache.
            memory_cache.put(`ServiceCache_${options.type}`, this.c);
        }
    }

    /**
     * Save value with specified key and retention.
     * @method
     * @async
     * @param {*} value
     * @param {String} key
     * @param {Number} [retention=1800] Seconds to retain this value.
     * @return {Boolean} Key to retrieve saved value.
     */
    async create_with_key(value, key, retention = 1800){
        let res = false;

        // If encryption is disabled, we just save and return key.
        if (process.env.ENCRYPTION !== "enable"){
            res = await this.c.create(`${prefix_cache}${key}`, value, retention);
        } else {
            // Encrypt.
            const encrypted_value = ServiceCacheDb._typed_encrypt(value);

            res = await this.c.create(`${prefix_cache}${key}`, encrypted_value, retention);
        }

        if (res == "OK"){
            return true;
        } else {
            return false;
        }
    }

    /**
     * Save value with specified retention and return random key.
     * @method
     * @async
     * @param {*} value
     * @param {Number} [retention=1800] Seconds to retain this value.
     * @return {String} Key to retrieve saved value.
     */
    async create(value, retention = 1800){
        const key = crypto.randomBytes(40).toString('hex');

        // If encryption is disabled, we just save and return key.
        if (process.env.ENCRYPTION !== "enable"){
            await this.c.create(`${prefix_cache}${key}`, value, retention);
            return key;
        }

        // Encrypt.
        const encrypted_value = ServiceCacheDb._typed_encrypt(value);

        await this.c.create(`${prefix_cache}${key}`, encrypted_value, retention);

        return key;
    }

    /**
     * Get value by key.
     * @method
     * @async
     * @param {String} key
     * @return {*}
     */
    async get(key){
        const value = await this.c.get(`${prefix_cache}${key}`);

        // If encryption is disabled, we just return value.
        if (process.env.ENCRYPTION !== "enable"){
            return value;
        }

        if (!value){
            return value;
        }

        // Decrypt.
        const decrypted_value = ServiceCacheDb._typed_decrypt(value);

        return decrypted_value;
    }

    /**
     * Delete value by key.
     * @method
     * @async
     * @param {String} key
     */
    async delete(key){
        return this.c.delete(`${prefix_cache}${key}`);
    }

    static _typed_encrypt(value){
        if (Buffer.isBuffer(value)){
            // Buffer.
            debug("Type is buffer.");
            return ServiceCacheDb._encrypt_buffer(value);
        } else if (Array.isArray(value)){
            // Array.
            debug("Type is array.");
            return ServiceCacheDb._encrypt_array(value);
        } else if (typeof value === "string"){
            // String.
            debug("Type is string.");
            return ServiceCacheDb._encrypt_string(value);
        } else if (typeof value === "object"){
            // Object.
            debug("Type is object.");
            return ServiceCacheDb._encrypt_object(value);
        } else {
            // Other.
            debug("Type is other.");
            return value;
        }
    }

    static _encrypt_object(value){
        let encrypted_value = {};

        for (const f of Object.keys(value)){
            encrypted_value[f] = ServiceCacheDb._typed_encrypt(value[f]);
        }

        return encrypted_value;
    }

    static _encrypt_array(value){
        let encrypted_value = [];

        for (const v of value){
            encrypted_value.push(ServiceCacheDb._typed_encrypt(v));
        }

        return encrypted_value;
    }

    static _encrypt_string(value){
        let encrypted_value;

        const cipher = crypto.createCipher("aes192", process.env.APP_SECRET);
        encrypted_value = cipher.update(value, "utf8", "hex");
        encrypted_value += cipher.final("hex");

        //debug(`Encrypted value: ${encrypted_value}`);
        return encrypted_value;
    }

    static _encrypt_buffer(value){
        let encrypted_value;

        const cipher = crypto.createCipher("aes192", process.env.APP_SECRET);
        encrypted_value = Buffer.concat([cipher.update(value), cipher.final()]);

        //debug(`Encrypted value: ${encrypted_value}`);
        return encrypted_value;
    }

    static _typed_decrypt(value){
        if (Buffer.isBuffer(value)){
            // Buffer.
            debug(`Type is buffer.`);
            return ServiceCacheDb._decrypt_buffer(value);
        } else if (Array.isArray(value)){
            // Array.
            debug(`Type is array.`);
            return ServiceCacheDb._decrypt_array(value);
        } else if (typeof value === "string"){
            // String.
            debug(`Type is string.`);
            return ServiceCacheDb._decrypt_string(value);
        } else if (typeof value === "object"){
            // Object.
            if (value.type === "Buffer" && value.data){
                debug(`Type is buffer.`);
                return ServiceCacheDb._decrypt_buffer(Buffer.from(value.data));
            }
            debug(`Type is object.`);
            return ServiceCacheDb._decrypt_object(value);
        } else {
            // Other.
            debug(`Type is other.`);
            return value;
        }
    }

    static _decrypt_object(value){
        let decrypted_value = {};

        for (const f of Object.keys(value)){
            decrypted_value[f] = ServiceCacheDb._typed_decrypt(value[f]);
        }

        //debug(`Decrypted value: ${decrypted_value}`);
        return decrypted_value;
    }

    static _decrypt_array(value){
        let decrypted_value = [];

        for (const v of value){
            decrypted_value.push(ServiceCacheDb._typed_decrypt(v));
        }

        //debug(`Decrypted value: ${decrypted_value}`);
        return decrypted_value;
    }

    static _decrypt_string(value){
        let decrypted_value;

        const cipher = crypto.createDecipher("aes192", process.env.APP_SECRET);
        decrypted_value = cipher.update(value, "hex", "utf8");
        decrypted_value += cipher.final("utf8");

        //debug(`Decrypted value: ${decrypted_value}`);
        return decrypted_value;
    }

    static _decrypt_buffer(value){
        let decrypted_value;

        const cipher = crypto.createDecipher("aes192", process.env.APP_SECRET);
        decrypted_value = Buffer.concat([cipher.update(value), cipher.final()]);

        //debug(`Decrypted value: ${decrypted_value}`);
        return decrypted_value;
    }
}
