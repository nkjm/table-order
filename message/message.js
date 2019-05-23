"use strict";

const debug = require("debug")("bot-express:message");

module.exports = class Message {
    constructor(translator){
        this.t = translator;
    }

    /**
     * @method
     * @param {Array.<Object>} required_option_list 
     * @param {Object} options 
     */
    check_required_option(required_option_list, options){
        for (let opt of required_option_list){
            if (options[opt] === undefined || options[opt] === null){
                throw new Error(`Required option "${opt}" not set.`);
            }
        }
    }

    /**
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.message_text
     * @param {Array.<String>} options.about_list
     * @return {Object} Message object.
     */
    async note_before_apply(options){
        const about_contents = Array.from(options.about_list, about => {
            return {
                type: "button",
                style: "link",
                height: "sm",
                action: {
                    type: "message",
                    label: about,
                    text: about
                }
            }
        });

        const message = {
            type: "flex",
            altText: options.message_text,
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{ 
                        // Message section.
                        type: "text",
                        text: options.message_text,
                        wrap: true
                    },{ 
                        // "About" section.
                        type: "box",
                        layout: "vertical",
                        contents: about_contents
                    }]
                },
                footer: {
                    type: "box",
                    layout: "horizontal",
                    spacing: "md",
                    contents: [{
                        type: "button",
                        style: "secondary",
                        height: "sm",
                        action: {
                            type: "postback",
                            label: await this.t.t(`quit`),
                            displayText: await this.t.t(`quit`),
                            data: JSON.stringify({
                                type: "intent",
                                intent: {
                                    name: "quit"
                                },
                                language: process.env.BOT_LANGUAGE || "en"
                            })
                        }
                    },{
                        type: "button",
                        style: "primary",
                        height: "sm",
                        action: {
                            type: "message",
                            label: await this.t.t(`proceed`),
                            text: await this.t.t(`proceed`)
                        }
                    }]
                }
            }
        } // End of message

        debug(JSON.stringify(message));

        return message;
    }

    /**
     * Create item object of quick reply.
     * @method
     * @async
     * @param {String} message_text 
     * @return {Object} Quick reply item.
     */
    async qr_create_aux_item(message_text){
        const item = {
            type: "action",
            action: {
                type: "message",
                label: null,
                text: message_text
            }
        }

        if (message_text.length > 20){
            item.action.label = message_text.slice(0, 18) + "..";
        } else {
            item.action.label = message_text;
        }

        return item;
    }

    /**
     * Add auxiality input item to the message. Just 1 item will be added. Check youngest element first.
     * @method
     * @async
     * @param {Object} options
     * @param {Object} options.message - Message object.
     * @param {Array.<Object|String>} options.aux_list - Array of quick reply item object or string for text.
     * @return {Object} Message object.
     */
    async qr_push_aux_item(options){
        if (!Array.isArray(options.aux_list)){
            debug(`aux_list is not array.`);
            return options.message;
        }

        for (let aux of options.aux_list){
            if (aux === undefined || aux === null){
                continue;
            } else if (typeof aux == "number"){
                aux = String(aux);
            } else if (typeof aux == "string"){
                aux = aux.trim();
                if (aux === ""){
                    continue;
                }
            } else if (typeof aux != "object"){
                throw new Error("Invalid aux.");
            }

            let item;
            if (typeof aux == "string"){
                item = await this.qr_create_aux_item(aux);
            } else {
                item = aux;
            }
            
            // If value is properly set, we use this and return.
            return await this.qr_push_item(options.message, item);

            // If we should add every aux texts, use following code instead.
            // message = await this.qr_push_item(message, item);
        }

        // If none of the aux_list is properly set, we just return original message object.
        debug(`none of aux_list is properly set.`);
        return options.message;
    }

    /**
     * Add quick reply button to first.
     * @method
     * @async
     * @param {Object} message 
     * @param {Object} item 
     * @return {Object} Message object.
     */
    async qr_unshift_item(message, item){
        if (item.action && item.action.label && item.action.label.length > 20){
            item.action.label = item.action.label.slice(0, 18) + "..";
        }

        if (message.quickReply && Array.isArray(message.quickReply.items)){
            if (message.quickReply.items.length < 13){
                message.quickReply.items.unshift(item);
            } else {
                debug(`Quick reply has already more than or equal to 13 items. We pop last item and adding new item to first.`);
                message.quickReply.items.pop();
                message.quickReply.items.unshift(item);
            }
        } else {
            message.quickReply = {
                items: [item]
            }
        }
        return message;
    }

    /**
     * Add quick reply button to last.
     * @method
     * @async
     * @param {Object} message 
     * @param {Object} item 
     * @return {Object} Message object.
     */
    async qr_push_item(message, item){
        if (item.action && item.action.label && item.action.label.length > 20){
            item.action.label = item.action.label.slice(0, 18) + "..";
        }

        if (message.quickReply && Array.isArray(message.quickReply.items)){
            if (message.quickReply.items.length < 13){
                message.quickReply.items.push(item);
            } else {
                debug(`Quick reply has already more than or equal to 13 items. We skip adding new item.`);
            }
        } else {
            message.quickReply = {
                items: [item]
            }
        }
        return message;
    }

    /**
     * Add quick reply button to quit conversation.
     * @method
     * @async
     * @param {Object} message
     * @return {Object} Message object.
     */
    async qr_add_quit(message){
        const item = {
            type: "action",
            action: {
                type: "postback",
                label: await this.t.t("quit"),
                displayText: await this.t.t("quit"),
                data: JSON.stringify({
                    type: "intent",
                    intent: {
                        name: "quit"
                    },
                    language: process.env.BOT_LANGUAGE || "en"
                })
            }
        }

        message = await this.qr_unshift_item(message, item);

        return message;
    }

    /**
     * Add quick reply button to modify previous parameter.
     * @method
     * @async
     * @param {Object} message
     * @param {context} context
     * @return {Object} Message object.
     */
    async qr_add_modify_prev_param(message, context){
        // We add modify previous parameter button as long as previously confirmed parameters exit.
        if (!(context && context.previous && Array.isArray(context.previous.processed) && context.previous.processed.length > 0)){
            return message
        }

        let label = await this.t.t("modify_prev_param"); 
        if (label.length > 20){
            label = label.slice(0, 18) + "..";
        } 
        
        const item = {
            type: "action",
            action: {
                type: "postback",
                label: label,
                displayText: await this.t.t("modify_prev_param"),
                data: JSON.stringify({
                    type: "intent",
                    intent: {
                        name: "modify_previous_parameter"
                    },
                    language: context.sender_language || process.env.BOT_LANGUAGE || "en"
                })
            }
        }

        message = await this.qr_unshift_item(message, item);

        return message;
    }

    /**
     * Create message composed of message_text, modify_prev_param and aux_input.
     * @method
     * @async
     * @param {*} options 
     * @param {String} options.message_text - Message text.
     * @param {Array.<Object|String>} options.aux_list - Array of quick reply item object or string for text.
     * @param {context} options.context
     * @return {Object} Message object.
     */
    async text_with_prev_aux(options){
        let message = {
            type: "text",
            text: options.message_text
        }

        message = await this.qr_add_modify_prev_param(message, options.context);

        message = await this.qr_push_aux_item({
            message: message, 
            aux_list: options.aux_list
        });

        return message;
    }

    /**
     * Create message composed of message_text and aux_input.
     * @method
     * @async
     * @param {*} options 
     * @param {String} options.message_text - Message text.
     * @param {Array.<Object|String>} options.aux_list - Array of quick reply item object or string for text.
     * @return {Object} Message object.
     */
    async text_with_aux(options){
        let message = {
            type: "text",
            text: options.message_text
        }

        message = await this.qr_push_aux_item({
            message: message, 
            aux_list: options.aux_list
        });

        return message;
    }

    /**
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.message_text
     * @param {Array.<String>} options.action_text_list
     * @return {Object} Message object.
     */
    async text_with_qr(options){
        let o = options;

        if (Array.isArray(o.action_text_list) && o.action_text_list.length >= 13){
            o.action_text_list = o.action_text_list.slice(0, 13);
        }

        let items = Array.from(o.action_text_list, action_text => {
            const item = {
                type: "action",
                action: {
                    type: "message",
                    label: action_text,
                    text: action_text,
                }
            }
            if (action_text.length > 20){
                item.action.label = action_text.slice(0, 18) + "..";
            } else {
                item.action.label = action_text;
            }
            return item;
        })

        let message = {
            type: "text",
            text: o.message_text,
            quickReply: {
                items: items
            }
        }

        debug(JSON.stringify(message));

        return message;
    }

    /**
     * Create three button message.
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.message_text
     * @param {Array.<Object>} options.button_list
     * @return {Object} Message object.
     */
    async three_button(options){
        let o = options;

        let button_contents = [{
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [{
                type: "box",
                layout: "horizontal",
                spacing: "md",
                contents: [{
                    type: "button",
                    style: o.button_list[0].style || "secondary",
                    height: o.button_list[0].height || "sm",
                    action: o.button_list[0].action
                },{
                    type: "button",
                    style: o.button_list[1].style || "secondary",
                    height: o.button_list[1].height || "sm",
                    action: o.button_list[1].action
                }]
            },{
                type: "button",
                style: o.button_list[2].style || "primary",
                height: o.button_list[2].height || "sm",
                action: o.button_list[2].action
            }]
        }]

        let message = {
            type: "flex",
            altText: o.message_text,
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "text",
                        text: o.message_text,
                        wrap: true
                    }]
                },
                footer: {
                    type: "box",
                    layout: "horizontal",
                    spacing: "md",
                    contents: button_contents
                }
            }
        }

        debug(JSON.stringify(message));

        return message;
    }

    /**
     * Create multi button message.
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.message_text
     * @param {Array.<Object>} options.action_list
     * @param {String} [options.layout="horizontal"] - horizontal or vertical
     * @return {Object} Message object.
     */
    async multi_button(options){
        let o = options;
        o.layout = o.layout || "horizontal";

        let button_contents = Array.from(o.action_list, action => {
            const style = action.style;
            delete action.style;
            return {
                type: "button",
                style: style || "link",
                height: "sm",
                action: action
            }
        });

        let message = {
            type: "flex",
            altText: o.message_text,
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{
                        type: "text",
                        text: o.message_text,
                        wrap: true
                    }]
                },
                footer: {
                    type: "box",
                    layout: o.layout,
                    spacing: "md",
                    contents: button_contents
                }
            }
        }

        debug(JSON.stringify(message));

        return message;
    }

    /**
     * Create single button message.
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.message_text
     * @param {Object} options.action
     * @return {Object} Message object.
     */
    async single_button(options){
        let o = options;

        let message = await this.multi_button({
            message_text: o.message_text,
            action_list: [o.action]
        })

        debug(JSON.stringify(message));

        return message;
    }

    /**
     * Create picklist message.
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.message_text
     * @param {Array.<String>} options.picklist
     * @return {Object} Message object.
     */
    async picklist(options){
        let o = options;

        let picklist_contents = [];
        for (let item of o.picklist){
            picklist_contents.push({
                type: "box",
                layout: "horizontal",
                spacing: "md",
                contents: [{
                    type: "text",
                    text: item,
                    size: "sm",
                    wrap: true
                },{
                    type: "button",
                    style: "primary",
                    flex: 0,
                    height: "sm",
                    action: {
                        type: "message",
                        label: await this.t.t(`select`),
                        text: item
                    }
                }]
            });
        }

        let message = {
            type: "flex",
            altText: o.message_text,
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "xl",
                    contents: [{
                        type: "text",
                        text: o.message_text,
                        wrap: true,
                        size: "md"
                    },{
                        type: "separator"
                    },{
                        type: "box",
                        layout: "vertical",
                        spacing: "xl",
                        contents: picklist_contents
                    }]
                }
            }
        }

        debug (JSON.stringify(message));

        return message;
    }

    /**
     * Create carousel message.
     * @method
     * @async
     * @param {Object} options
     * @param {String} options.message_text
     * @param {Array.<bubble>} options.bubble_list
     * @return {Object} Message object.
     */
    async carousel(options){
        let o = options;

        if (Array.isArray(o.bubble_list) && o.bubble_list.length > 10){
            o.bubble_list = o.bubble_list.slice(0, 10);
        }

        let message = {
            type: "flex",
            altText: o.message_text,
            contents: {
                type: "carousel",
                contents: o.bubble_list
            }
        }

        return message;
    }
}
