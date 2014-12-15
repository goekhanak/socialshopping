define(['socialShoppingModule'], function (module) {
    'use strict';

    module.controller('SocialController', ['$scope', '$injector',
            function ($scope, $injector) {
        var $firebase = $injector.get('$firebase');
        var $firebaseAuth = $injector.get('$firebaseAuth');
        var $log = $injector.get('$log');
        var cons = $injector.get('cons');
        var $rootScope = $injector.get('$rootScope');
        var Firebase = $injector.get('Firebase');

        var self = this;


        function init() {

            self.firebaseRef = new Firebase(cons.FIREBASE_BASE_URL);
            self.authObj = $firebaseAuth(self.firebaseRef);

            self.authObj.$authWithOAuthPopup('facebook').then(function(authData) {
                console.log('Logged in as:', authData);

                //self.displayName = authData.facebook.displayName;
                self.messagesRef = self.firebaseRef .child('messages');
                self.messagesSync = $firebase(self.messagesRef);
                self.messages = self.messagesSync.$asArray();

                self.participantsRef = self.firebaseRef .child('participants');
                self.participantsSync = $firebase(self.participantsRef);
                self.participants = self.participantsSync.$asArray();

                self.participants.$loaded(function(x) {
                    var userExists = false;
                    for(var i=0; i < self.participants.length;i++){
                        var participant = self.participants[i];
                        if(participant.id === $rootScope.currentFBUser.id){
                            userExists = true;
                        }
                    }

                    if(userExists === false){
                        self.participants.$add($rootScope.currentFBUser);
                    }
                }, function(error) {
                    $log.error('Error:', error);
                });

                $rootScope.currentFBUser.displayName = authData.facebook.displayName;
                $rootScope.currentFBUser.profilePicture = authData.facebook.cachedUserProfile.picture.data.url;
                $rootScope.currentFBUser.id = authData.facebook.id;


            }).catch(function(error) {
                console.error('Authentication failed:', error);
            });
        }

        function addMessage(){
            self.messages.$add({
                content:self.newMessage,
                postedBy:  $rootScope.currentFBUser.displayName, // get it from facebook login
                postedDate: Date.now(),
               // userImg: 'images/user.png'
                userImg:  $rootScope.currentFBUser.profilePicture
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




        $scope.$on('$destroy', function handler() {
            for(var i=0; i < self.participants.length;i++){
                var participant = self.participants[i];
                if(participant.id === $rootScope.currentFBUser.id){
                    self.participants.$remove(participant);
                }
            }
        });

    }
    ]);
});