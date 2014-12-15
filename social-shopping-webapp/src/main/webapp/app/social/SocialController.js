define(['socialShoppingModule'], function (module) {
    'use strict';

    module.controller('SocialController', ['$scope', '$injector',
            function ($scope, $injector) {
        var $firebase = $injector.get('$firebase');
        var cons = $injector.get('cons');

        var self = this;

        self.messagesRef = new Firebase(cons.FIREBASE_BASE_URL+'messages');
        self.messagesSync = $firebase(self.messagesRef);

        function init() {
            // if ref points to a data collection
            self.messages = self.messagesSync.$asArray();


        }

        function addMessage(){
            self.messages.$add({
                message:self.newMessage,
                createdBy: 'tbd', // get it from facebook login
                created: Date.now()
                });
            self.newMessage = null;
        }

        function onMessageKeyPress($event){
            // when submit is pressed
            if (13 === $event.keyCode) {
                $event.preventDefault();
                self.addMessage();
            }
        }

        self.init = init;
        self.addMessage = addMessage;
        self.onMessageKeyPress = onMessageKeyPress;

        /*functions called*/
        self.init();
    }
    ]);
});