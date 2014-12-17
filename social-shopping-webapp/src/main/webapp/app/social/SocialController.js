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
            var ShopService = $injector.get('ShopService');

            var self = this;

            self.filterCriteria = {};

            function loadMasterData() {
                self.targetGroups = ShopService.getTargetGroups();
            }

            function connectToFirebase() {
                self.firebaseRef = new Firebase(cons.FIREBASE_BASE_URL);
                self.authObj = $firebaseAuth(self.firebaseRef);

                self.authObj.$authWithOAuthPopup('facebook').then(function (authData) {
                    $log.debug('Logged in as:', authData);


                    self.messagesRef = self.firebaseRef.child('messages');
                    self.messagesSync = $firebase(self.messagesRef);
                    self.messages = self.messagesSync.$asArray();

                    self.participantsRef = self.firebaseRef.child('participants');
                    self.participantsSync = $firebase(self.participantsRef);
                    self.participants = self.participantsSync.$asArray();


                    var articlesRef = self.firebaseRef.child('articles');
                    var articlesSync = $firebase(articlesRef);
                    self.articles = articlesSync.$asArray();

                    self.participants.$loaded(function () {
                        var userExists = false;
                        for (var i = 0; i < self.participants.length; i++) {
                            var participant = self.participants[i];
                            if (participant.id === $rootScope.currentFBUser.id) {
                                userExists = true;
                            }
                        }

                        if (userExists === false) {
                            self.participants.$add($rootScope.currentFBUser);
                        }
                    }, function (error) {
                        $log.error('Error:', error);
                    });

                    $rootScope.currentFBUser.displayName = authData.facebook.displayName;
                    $rootScope.currentFBUser.profilePicture = authData.facebook.cachedUserProfile.picture.data.url;
                    $rootScope.currentFBUser.id = authData.facebook.id;


                }).catch(function (error) {
                    console.error('Authentication failed:', error);
                });
            }

            function init() {
                self.loadMasterData();
                connectToFirebase();
            }

            function onTargetGroupChange(targetGroup) {
                self.targetGroup = targetGroup;

                $log.debug('Target Group selected: ', targetGroup);

                ShopService.getCategories(targetGroup.code).$promise.then(function (result) {
                        self.categories = result.content;
                    },
                    //error
                    function (error) {
                        $log.error('getCategories failed with targetGroup: :', targetGroup);
                    });
            }

            function onSearchFilterKeyPress($event) {
                // when submit is pressed
                if (13 === $event.keyCode) {
                    $event.preventDefault();
                    self.searchArticles();
                }
            }

            function searchArticles() {
                var filter = {
                    category: self.filterCriteria.category.key,
                    fullText: self.filterCriteria.articleName
                };

                ShopService.searchArticles(filter).$promise.then(function (result) {
                        self.searchedArticles = result.content;
                    },
                    //error
                    function (error) {
                        $log.error('searchArticles failed with filter: :', filter);
                    }
                );
            }


            function addArticle(article) {
                self.articles.$add({
                    id: article.id,
                    name: article.name,
                    shopUrl: article.shopUrl,
                    brandName: article.brand.name,
                    thumbnailUrl: article.media.images[0].thumbnailUrl,
                    price: article.units[0].price.formatted,
                    thumbsUp: [],
                    thumbsDown: []
                });
            }

            function removeArticle(articleToRemove) {
                for (var i = 0; i < self.articles.length; i++) {
                    var article = self.articles[i];
                    if (article.id === articleToRemove.id) {
                        self.articles.$remove(article);
                    }
                }
            }

            function thumpsUp(article){
                if(!article.thumbsUp){
                    $log.debug('No thumbsUp array exists!');
                    article.thumbsUp = [$rootScope.currentFBUser.id];
                }else if(article.thumbsUp.indexOf($rootScope.currentFBUser.id) < 0){
                    article.thumbsUp.push($rootScope.currentFBUser.id);
                }else{
                    article.thumbsUp.splice(article.thumbsUp.indexOf($rootScope.currentFBUser.id),1);
                }

                // Remove yourself from thumbsDown if exists
                if(article.thumbsDown && article.thumbsDown.indexOf($rootScope.currentFBUser.id) > -1){
                    article.thumbsDown.splice(article.thumbsDown.indexOf($rootScope.currentFBUser.id),1);
                }
            }

            function thumpsDown(article){
                if(!article.thumbsDown){
                    $log.debug('No thumbsDown array exists!');
                    article.thumbsDown = [$rootScope.currentFBUser.id];
                }else if(article.thumbsDown.indexOf($rootScope.currentFBUser.id) < 0){
                    article.thumbsDown.push($rootScope.currentFBUser.id);
                }else{
                    article.thumbsDown.splice(article.thumbsDown.indexOf($rootScope.currentFBUser.id),1);
                }

                // Remove yourself from thumbsDown if exists
                if(article.thumbsUp && article.thumbsUp.indexOf($rootScope.currentFBUser.id) > -1){
                    article.thumbsUp.splice(article.thumbsUp.indexOf($rootScope.currentFBUser.id),1);
                }
            }

            function addMessage() {
                self.messages.$add({
                    content: self.newMessage,
                    postedBy: $rootScope.currentFBUser.displayName, // get it from facebook login
                    postedDate: Date.now(),
                    // userImg: 'images/user.png'
                    userImg: $rootScope.currentFBUser.profilePicture
                });
                self.newMessage = null;
            }

            function onMessageKeyPress($event) {
                // when submit is pressed
                if (13 === $event.keyCode) {
                    $event.preventDefault();
                    self.addMessage();
                }
            }


            self.init = init;

            /*Search Articles related */
            self.onTargetGroupChange = onTargetGroupChange;
            self.onSearchFilterKeyPress = onSearchFilterKeyPress;
            self.searchArticles = searchArticles;

            /*rate articles related*/
            self.addArticle = addArticle;
            self.removeArticle = removeArticle;
            self.thumpsUp = thumpsUp;
            self.thumpsDown = thumpsDown;

            /*Chat related */
            self.addMessage = addMessage;
            self.onMessageKeyPress = onMessageKeyPress;
            self.loadMasterData = loadMasterData;


            /*functions called*/
            self.init();


            $scope.$on('$destroy', function handler() {
                for (var i = 0; i < self.participants.length; i++) {
                    var participant = self.participants[i];
                    if (participant.id === $rootScope.currentFBUser.id) {
                        self.participants.$remove(participant);
                    }
                }
            });

        }
    ]);
});