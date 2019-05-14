"use strict";

const debug = require("debug")("bot-express:service");
const dialogflow = require("dialogflow");

// Instantiates clients
const contexts_client = new dialogflow.ContextsClient({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    }
});
const intents_client = new dialogflow.IntentsClient({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    }
});

// The path to identify the agent that owns the created intent.
const agent_path = intents_client.projectAgentPath(process.env.GOOGLE_PROJECT_ID);

module.exports = class ServiceDialogflow {
    static get_intents(){

    }

    /**
    @method add_intent
    @param {Object} intent
    @param {String} intent.name
    @param {String} intent.training_phrase
    @param {String} intent.action
    @param {String} intent.text_response
    */
    static add_intent(intent){

        const training_phrases = [{
            type: "TYPE_EXAMPLE",
            parts: [{text: intent.training_phrase}]
        }]

        const new_intent = {
            displayName: intent.name,
            webhookState: 'WEBHOOK_STATE_DISABLED',
            trainingPhrases: training_phrases,
            action: intent.action,
            messages: [{
                text: {
                    text: [intent.text_response]
                }
            }]
        };

        const request = {
            parent: agent_path,
            intent: new_intent
        }

        return intents_client.createIntent(request);
    }
}
