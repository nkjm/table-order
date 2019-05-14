angular.module("foodcourt")
.controller("rootCtl", function($scope, $log, $filter, GOOGLE_PROJECT_ID, FIREBASE_API_KEY, FIREBASE_MESSAGING_SENDER_ID, RESTAURANTE_ID){
    $scope.ui = {};
    $scope.ui.alert_list = [];

    // Initialize Firebase.
    var config = {
        apiKey: FIREBASE_API_KEY,
        authDomain: GOOGLE_PROJECT_ID + ".firebaseapp.com",
        databaseURL: "https://" + GOOGLE_PROJECT_ID + ".firebaseio.com",
        projectId: GOOGLE_PROJECT_ID,
        storageBucket: GOOGLE_PROJECT_ID + ".appspot.com",
        messagingSenderId: FIREBASE_MESSAGING_SENDER_ID
    };
    firebase.initializeApp(config);

    // FirebaseUI config.
    var uiConfig = {
        signInSuccessUrl: "/console/" + RESTAURANTE_ID + "/order_board",
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            {
                requireDisplayName: false
            }
        ],
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        tosUrl: '/',
        // Privacy policy url/callback.
        privacyPolicyUrl: function() {
            window.location.assign('/');
        }
    };

    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
});
