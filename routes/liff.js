"use strict";

const express = require('express');
const router = express.Router();
const debug = require("debug")("bot-express:route");

/**
 * Redirect to form to input credit card information hosted by stripe.
 * @param {String} session_id - LINE user id.
 */
router.get("/stripe", async (req, res, next) => {
    const options = {
        api_key: process.env.STRIPE_API_KEY,
        session_id: req.query.session_id
    }

    res.render("stripe", options);
})

router.get("/line_pay", async (req, res, next) => {
    debug(`Redirecting to ${req.query.payment_url}`);

    if (typeof req.query.payment_url !== "string"){
        debug("Invalid payment url.");
        return res.status(400).json({
            message: "Invalid payment url."
        })
    }

    if (!req.query.payment_url.match(/^https:\/\/sandbox-web-pay\.line\.me\//) && !req.query.payment_url.match(/^https:\/\/web-pay\.line\.me\//)){
        debug("Invalid payment url.");
        return res.status(400).json({
            message: "Invalid payment url."
        })
    }

    return res.redirect(req.query.payment_url);
})

module.exports = router;
