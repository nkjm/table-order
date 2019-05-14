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
router.get("/:restaurante_id/login", async (req, res) => {
    if (!req.params.restaurante_id.match(/^[a-z]+$/)){
        return res.render("error", {
            severity: "danger",
            message: "Restaurante ID is invalid."
        })
    }

    return res.render("login", {
        google_project_id: process.env.GOOGLE_PROJECT_ID,
        firebase_api_key: process.env.FIREBASE_API_KEY,
        firebase_messaging_sender_id: process.env.FIREBASE_MESSAGING_SENDER_ID,
        restaurante_id: req.params.restaurante_id
    });
});

/**
 * Order board.
 */
router.get("/:restaurante_id/order_board", async (req, res) => {
    if (!req.params.restaurante_id.match(/^[a-z]+$/)){
        return res.render("error", {
            severity: "danger",
            message: "Restaurante ID is invalid."
        })
    }

    return res.render("order_board", {
        google_project_id: process.env.GOOGLE_PROJECT_ID,
        firebase_api_key: process.env.FIREBASE_API_KEY,
        firebase_messaging_sender_id: process.env.FIREBASE_MESSAGING_SENDER_ID,
        restaurante_id: req.params.restaurante_id
    });
});

module.exports = router;
