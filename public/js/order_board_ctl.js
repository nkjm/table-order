angular.module("foodcourt")
.controller("rootCtl", function($scope, $http, $log, $filter, GOOGLE_PROJECT_ID, FIREBASE_API_KEY, FIREBASE_MESSAGING_SENDER_ID, RESTAURANTE_ID){
    moment.locale("ja");
    
    $scope.ui = {};
    $scope.state = {};
    $scope.ui.order_list = [];
    $scope.ui.alert_list = [];
    $scope.ui.tab_list = [{
        status: "paid",
        label: "調理中",
        deletable: true,
        button_list: [{
            label: "呼び出し",
            icon: "bell",
            to_status: "ready",
            update_timestamp: true
        }],
        order_list: []
    },{
        status: "ready",
        label: "呼び出し中",
        deletable: true,
        button_list: [{
            label: "提供完了",
            icon: "check",
            to_status: "served",
            update_timestamp: true
        }],
        order_list: []
    },{
        status: "served",
        label: "提供済み",
        deletable: false,
        button_list: [{
            label: "呼び出し中に戻す",
            icon: "undo",
            to_status: "ready",
            update_timestamp: false,
            style: "light"
        }],
        order_list: []
    },{
        status: "deleted",
        label: "削除済み",
        deletable: false,
        button_list: [{
            label: "調理中に戻す",
            icon: "undo",
            to_status: "paid",
            update_timestamp: false,
            style: "light"
        }],
        order_list: []
    }]
    $scope.ui.current_tab = $scope.ui.tab_list[0];

    var wait_alert_info_threshold = 300;
    var wait_alert_warning_threshold = 600;
    var wait_alert_danger_threshold = 900;

    $scope.update_order_status = function(order_id, status, update_timestamp = true){
        $scope.ui.alert_list = [];

        // Fade order out.
        for (var order of $scope.ui.current_tab.order_list){
            if (order.id === order_id){
                order.hide = true;
            }
        }

        // Update timestamp.
        var update = {}
        update.status = status;
        if (update_timestamp){
            update[status + "_at"] = new Date();
        }

        // Save to db after fade out completes.
        setTimeout(function(){
            return db.collection("restaurants").doc(RESTAURANTE_ID).collection("orders").doc(order_id).update(update)
            .catch(
                function(error){
                    console.log(error);
                    var alert = {
                        severity: "danger"
                    }
                    if (error && error.data && error.data.error && error.data.error.message){
                        alert.message = error.data.error.message;
                    } else if (error && error.message) {
                        alert.message = error.message;
                    } else {
                        alert.message = "Unknown error.";
                    }
                    $scope.ui.alert_list.push(alert);
                }
            );
        }, 1000);
    }

    $scope.get_order_list = function(){
        var start_ts = new Date();
        start_ts.setHours(0, 0, 0);
        var end_ts = new Date();
        end_ts.setHours(23, 59, 59, 999);
        db.collection("restaurants").doc(RESTAURANTE_ID).collection("orders").where("paid_at", ">=", start_ts).where("paid_at", "<=", end_ts).orderBy("paid_at").onSnapshot(
            function(query_snapshot) {
                // Clear order list of each tab.
                for (var tab of $scope.ui.tab_list){
                    tab.order_list = [];
                }

                // Process each orders. Set formatted paid_at and put into order_list of corresponding tab.
                query_snapshot.forEach(
                    function(doc) {
                        var order = doc.data();
                        order.formatted_paid_at = moment(order.paid_at.toDate()).format("LTS");
                        
                        for (var tab of $scope.ui.tab_list){
                            if (tab.status === order.status){
                                tab.order_list.push(order);
                            }
                        }
                    }
                );
                $scope.$apply();
            },
            function(response){
                if (response && response.code === "permission-denied"){
                    location.href = "/console/" + RESTAURANTE_ID + "/login";
                }
                console.log("Unknown error.");
                console.log(response);
            }
        );
    }

    var auth = function() {
        firebase.auth().onAuthStateChanged(
            function(user) {
                if (user) {
                    /*
                    console.log(user);
                    // User is signed in.
                    var displayName = user.displayName;
                    var email = user.email;
                    var emailVerified = user.emailVerified;
                    var photoURL = user.photoURL;
                    var uid = user.uid;
                    var phoneNumber = user.phoneNumber;
                    var providerData = user.providerData;
                    user.getIdToken().then(
                        function(access_token) {
                            console.log("access_token: " + access_token);
                            $scope.state.access_token = access_token;
                        }
                    );
                    */
                    $scope.get_order_list();
                } else {
                    console.log("User has not singed in.");
                }
            }, 
            function(error) {
                console.log(error);
            }
        );
    }

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

    // Initialize Firestore.
    var db = firebase.firestore();
    db.settings({
        timestampsInSnapshots: true
    });

    // Start authentication.
    /*
    window.addEventListener('load', function() {
        auth();
    });
    */

    $scope.get_order_list();
});
