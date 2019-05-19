"use strict";

require("dotenv").config();

/*
** Import Packages
*/
const express = require("express");
const server = express();
const bot_express = require("bot-express");
const path = require('path');

server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'ejs');
server.use(express.static(path.join(__dirname, 'public')));

/*
** Middleware Configuration
*/
server.listen(process.env.PORT || 5000, () => {
    console.log("server is running...");
});

/*
** Mount bot-express
*/
server.use("/bot/webhook", bot_express({
    language: process.env.BOT_LANGUAGE || "en",
    messenger: {
        line: {
            channel_id: process.env.LINE_BOT_CHANNEL_ID,
            channel_secret: process.env.LINE_BOT_CHANNEL_SECRET
        }
    },
    nlu: {
        type: "dialogflow",
        options: {
            project_id: process.env.GOOGLE_PROJECT_ID,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY,
            language: process.env.BOT_LANGUAGE || "en"
        }
    },
    parser: [{
        type: "dialogflow",
        options: {
            project_id: process.env.GOOGLE_PROJECT_ID,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY,
            language: process.env.BOT_LANGUAGE || "en"
        }
    }],
    memory: {
        type: "memory-cache",
        retention: Number(process.env.MEMORY_RETENTION)
    },
    translator: {
        type: "google",
        enable_lang_detection: true,
        enable_translation: true,
        options: {
            project_id: process.env.GOOGLE_PROJECT_ID,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY
        }
    },
    skill: {
        default: process.env.DEFAULT_SKILL,
        follow: "follow"
    },
    modify_previous_parameter_intent: "modify_previous_parameter"
}));

/**
 * Mount LIFF
 */
const routes_liff = require("./routes/liff");
server.use("/liff", routes_liff);

/**
 * Mount LINE Pay
 */
const routes_line_pay = require("./routes/line_pay");
server.use("/line_pay", routes_line_pay);

/**
 * Mount Stripe
 */
const routes_stripe = require("./routes/stripe");
server.use("/stripe", routes_stripe);

/**
 * Mount Console
 */
const routes_console = require("./routes/console");
server.use("/console", routes_console);

module.exports = server;
