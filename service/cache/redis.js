"use strict";

require("dotenv").config();

const debug = require("debug")("bot-express:service");
const Redis = require("ioredis");
const required_option_list = [];

module.exports = class ServiceCacheRedis {
    /**
     * Create redis client. Check cache first and reuse it if there is.
     * @constructor
     * @param {Object} options
     * @param {String} [options.url] - The URL of the Redis server. Format: [redis[s]:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]] *Either url or host and port is required.
     * @param {String} [options.host] - IP address of the Redis server. *Either url or host and port is required.
     * @param {String} [options.port] - Port of the Redis server. *Either url or host and port is required.
     * @param {String} [options.password] - If set, client will run Redis auth command on connect.
     * @param {Boolean} [options.tls] - If true, client will connect to server over TLS.
     */
    constructor(options){
        // Check required options.
        for (let req_opt of required_option_list){
            if (options[req_opt] === undefined){
                throw new Error(`Required option "${req_opt}" for ServiceCacheRedis not set.`);
            }
        }

        const o = JSON.parse(JSON.stringify(options));
        
        if (o.tls === "enable" || o.tls === true){
            o.tls = {
                rejectUnauthorized: false,
                requestCert: true,
                agent: false
            }
        }

        if (o.url){
            this.client = new Redis(o.url, o);
        } else {
            this.client = new Redis(o);
        }
    }

    /**
     * Save value with specified key and retention.
     * @method
     * @async
     * @param {String} key
     * @param {*} value
     * @param {Number} retention
     */
    async create(key, value, retention){
        if (Buffer.isBuffer(value)){
            // We do not stringify this value.
            debug(`This is buffer so we do not stringify.`);
        } else {
            debug(`Stringifying value.`);
            value = JSON.stringify(value);
        }
        if (retention){
            return this.client.set(key, value, "EX", retention, "NX");
        } else {
            return this.client.set(key, value, "NX");
        }
    }

    /**
     * Get value by key.
     * @method
     * @async
     * @param {String} key
     * @return {*}
     */
    async get(key){
        return this.client.get(key).then((response) => {
            if (response){
                return JSON.parse(response);
            }

            return null;
        })
    }

    /**
     * Delete value by key.
     * @method
     * @async
     * @param {String} key
     */
    async delete(key){
        return this.client.del(key);
    }

    async close(){
        return this.client.quit();
    }
}
