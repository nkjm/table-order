"use strict";

var stripe = Stripe(api_key);

liff.init(
    function(data){
        stripe.redirectToCheckout({
            sessionId: session_id
        }).then(function (result) {
            // If `redirectToCheckout` fails due to a browser or network
            // error, display the localized error message to your customer
            // using `result.error.message`.
            alert(result.error.message);
        });
    },
    function(error){
        // alert(JSON.stringify(error))
    }
);