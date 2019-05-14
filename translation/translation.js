"use strict";

const debug = require("debug")("bot-express:translation");
const label = require("../translation/label");

module.exports = class Translation {
    constructor(translator, lang){
        if (lang && !lang.match(/^[a-z]{2}$/) && !lang.match(/^[a-z]{2}-[A-Z]{2}$/)){
            throw new Error(`Unsupported lang is specified.`);
        }

        this.translator = translator;
        this.lang = lang || "ja";
    }

    async translate(key, options){

        // Corresponding translation found.
        if (label[key] && label[key][this.lang] !== undefined){
            let translation;
            if (options === undefined){
                if (typeof label[key][this.lang] != "string"){
                    throw new Error(`Expecting translation being string but ${typeof label[key][this.lang]}`);
                }
                translation = label[key][this.lang];
            } else {
                if (typeof label[key][this.lang] != "function"){
                    throw new Error(`Expecting translation being function but ${typeof label[key][this.lang]}`);
                }
                translation = label[key][this.lang](options);
            }

            return translation;
        }

        // If the key found but corresponding translation not found, we make translation or use first translation.
        if (label[key] && Object.keys(label[key]).length > 0){

            // Extract the first translation.
            let source_label;
            if (options === undefined){
                if (typeof label[key][Object.keys(label[key])[0]] != "string"){
                    throw new Error(`Expecting translation being string but ${typeof label[key][Object.keys(label[key])[0]]}`);
                }
                source_label = label[key][Object.keys(label[key])[0]];
            } else {
                if (typeof label[key][Object.keys(label[key])[0]] != "function"){
                    throw new Error(`Expecting translation being function but ${typeof label[key][Object.keys(label[key])[0]]}`);
                }
                source_label = label[key][Object.keys(label[key])[0]](options);
            }

            if (this.translator && this.translator.enable_translation){
                // If translator is available, we make translation using first translation.
                let translation = await this.translator.translate(source_label, this.lang);
                return translation;
            } else {
                // If translator is not available, we use first translation as it is.
                return source_label;
            }
        }

        // If key not found, we throw error.
        throw new Error(`${key} not found or no translation is available.`);
    }

    // Alias to translate()
    async t(key, options){
        return this.translate(key, options)
    }
}
