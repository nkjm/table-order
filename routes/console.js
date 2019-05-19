"use strict";

/**
 * Import packages
 */
const express = require('express');
const router = express.Router();
const debug = require("debug")("bot-express:route");

/**
 * Login.
 */
router.get("/login", async (req, res) => {
    return res.render("login", {
        google_project_id: process.env.FIREBASE_PROJECT_ID,
        firebase_api_key: process.env.FIREBASE_API_KEY,
        firebase_messaging_sender_id: process.env.FIREBASE_MESSAGING_SENDER_ID,
        language: process.env.BOT_LANGUAGE || "en"
    });
});

/**
 * Order board.
 */
router.get("/order_board", async (req, res) => {
    return res.render("order_board", {
        google_project_id: process.env.FIREBASE_PROJECT_ID,
        firebase_api_key: process.env.FIREBASE_API_KEY,
        firebase_messaging_sender_id: process.env.FIREBASE_MESSAGING_SENDER_ID,
        language: process.env.BOT_LANGUAGE || "en"
    });
});

module.exports = router;
