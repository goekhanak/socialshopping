/// <reference path='../_all.ts' />
define(['socialShoppingModule'], function (socialModule) {
    'use strict';
    socialModule.controller('SocialController', ['$scope', '$injector', function ($scope, $injector) {
        return new social.SocialController($scope, $injector);
    }]);
});
var social;
(function (social) {
    var SocialController = (function () {
        function SocialController($scope, $injector) {
            var _this = this;
            this.$firebase = $injector.get('$firebase');
            this.$firebaseAuth = $injector.get('$firebaseAuth');
            this.$log = $injector.get('$log');
            this.cons = $injector.get('cons');
            this.$rootScope = $injector.get('$rootScope');
            this.Firebase = $injector.get('Firebase');
            this.shopService = $injector.get('ShopService');
            this.CommentExpanded = [];
            this.loadMasterData();
            this.connectToFirebase();
            $scope.calculateThumbs = function (article) {
                return (article.thumbsDown ? article.thumbsDown.length : 0) - (article.thumbsUp ? article.thumbsUp.length : 0);
            };
            $scope.$on('$destroy', function () {
                for (var i = 0; i < _this.participants.length; i++) {
                    var participant = _this.participants[i];
                    if (participant.id === _this.$rootScope.currentFBUser.id) {
                        _this.participants.$remove(participant);
                    }
                }
            });
        }
        SocialController.prototype.connectToFirebase = function () {
            var _this = this;
            var firebaseRef = new Firebase(this.cons.FIREBASE_BASE_URL);
            var authObj = this.$firebaseAuth(firebaseRef);
            authObj.$authWithOAuthPopup('facebook').then(function (authData) {
                _this.$log.debug('Logged in as:', authData);
                var messagesRef = firebaseRef.child('messages');
                var messagesSync = _this.$firebase(messagesRef);
                _this.messages = messagesSync.$asArray();
                var participantsRef = firebaseRef.child('participants');
                var participantsSync = _this.$firebase(participantsRef);
                _this.participants = participantsSync.$asArray();
                var articlesRef = firebaseRef.child('articles');
                var articlesSync = _this.$firebase(articlesRef);
                _this.articles = articlesSync.$asArray();
                _this.participants.$loaded(function () {
                    var userExists = false;
                    for (var i = 0; i < _this.participants.length; i++) {
                        var participant = _this.participants[i];
                        if (participant.id === _this.$rootScope.currentFBUser.id) {
                            userExists = true;
                        }
                    }
                    if (userExists === false) {
                        _this.participants.$add(_this.$rootScope.currentFBUser);
                    }
                }, function (error) {
                    _this.$log.error('Error:', error);
                });
                _this.$rootScope.currentFBUser.displayName = authData.facebook.displayName;
                _this.$rootScope.currentFBUser.profilePicture = authData.facebook.cachedUserProfile.picture.data.url;
                _this.$rootScope.currentFBUser.id = authData.facebook.id;
            }).catch(function (error) {
                console.error('Authentication failed:', error);
            });
        };
        SocialController.prototype.loadMasterData = function () {
            var _this = this;
            this.targetGroups = this.shopService.getTargetGroups();
            angular.forEach(this.targetGroups, function (targetGroup) {
                _this.$log.debug('targetGroup.code: ' + targetGroup.code, +'targetGroup.name: ' + targetGroup.name);
            });
        };
        SocialController.prototype.onTargetGroupChange = function (targetGroup) {
            var _this = this;
            this.targetGroup = targetGroup;
            this.$log.debug('Target Group selected: ', targetGroup);
            this.shopService.getCategories(targetGroup.code).$promise.then(function (result) {
                _this.categories = result.content;
            }, 
            //error
            function (error) {
                this.$log.error('getCategories failed with targetGroup: :', targetGroup);
            });
        };
        SocialController.prototype.onSearchFilterKeyPress = function ($event) {
            // when submit is pressed
            if (13 === $event.keyCode) {
                $event.preventDefault();
                this.searchArticles();
            }
        };
        SocialController.prototype.searchArticles = function () {
            var _this = this;
            var filter = {
                category: this.filterCriteria.category.key,
                fullText: this.filterCriteria.articleName
            };
            this.shopService.searchArticles(filter).$promise.then(function (result) {
                _this.searchedArticles = result.content;
            }, 
            //error
            function (error) {
                _this.$log.error('searchArticles failed with filter: :', filter);
            });
        };
        SocialController.prototype.addArticle = function (article) {
            this.articles.$add({
                id: article.id,
                name: article.name,
                shopUrl: article.shopUrl,
                brandName: article.brand.name,
                thumbnailUrl: article.media.images[0].smallUrl,
                price: article.units[0].price.formatted,
                thumbsUp: [],
                thumbsDown: []
            });
        };
        SocialController.prototype.removeArticle = function (articleToRemove) {
            for (var i = 0; i < this.articles.length; i++) {
                var article = this.articles[i];
                if (article.$id === articleToRemove.$id) {
                    this.articles.$remove(article);
                }
            }
        };
        SocialController.prototype.articleThumpsUpped = function (article) {
            if (!article.thumbsUp) {
                return false;
            }
            return article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id) > -1;
        };
        SocialController.prototype.articleThumpsDowned = function (article) {
            if (!article.thumbsDown) {
                return false;
            }
            return article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id) > -1;
        };
        SocialController.prototype.thumpsUp = function (article) {
            if (!article.thumbsUp) {
                this.$log.debug('No thumbsUp array exists!');
                article.thumbsUp = [this.$rootScope.currentFBUser.id];
            }
            else if (article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id) < 0) {
                article.thumbsUp.push(this.$rootScope.currentFBUser.id);
            }
            else {
                article.thumbsUp.splice(article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id), 1);
            }
            // Remove yourself from thumbsDown if exists
            if (article.thumbsDown && article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id) > -1) {
                article.thumbsDown.splice(article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id), 1);
            }
            this.articles.$save(article);
        };
        SocialController.prototype.thumpsDown = function (article) {
            if (!article.thumbsDown) {
                this.$log.debug('No thumbsDown array exists!');
                article.thumbsDown = [this.$rootScope.currentFBUser.id];
            }
            else if (article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id) < 0) {
                article.thumbsDown.push(this.$rootScope.currentFBUser.id);
            }
            else {
                article.thumbsDown.splice(article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id), 1);
            }
            // Remove yourself from thumbsDown if exists
            if (article.thumbsUp && article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id) > -1) {
                article.thumbsUp.splice(article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id), 1);
            }
            this.articles.$save(article);
        };
        SocialController.prototype.toggleExpandComments = function (article) {
            if (!this.CommentExpanded[article.id]) {
                this.CommentExpanded[article.id] = true;
            }
            else {
                this.CommentExpanded[article.id] = false;
            }
        };
        SocialController.prototype.onCommentKeyPress = function (article, $event) {
            // when submit is pressed
            if (13 === $event.keyCode) {
                $event.preventDefault();
                this.addComment(article);
            }
        };
        SocialController.prototype.addComment = function (article) {
            if (!article.comments) {
                article.comments = [];
            }
            article.comments.push({
                content: this.newComment[article.id],
                postedBy: this.$rootScope.currentFBUser.displayName,
                postedDate: Date.now(),
                userImg: this.$rootScope.currentFBUser.profilePicture
            });
            // synchronize with server
            this.articles.$save(article);
            this.newComment[article.id] = null;
        };
        SocialController.prototype.addMessage = function () {
            this.messages.$add({
                content: this.newMessage,
                postedBy: this.$rootScope.currentFBUser.displayName,
                postedDate: Date.now(),
                userImg: this.$rootScope.currentFBUser.profilePicture
            });
            this.newMessage = null;
        };
        SocialController.prototype.onMessageKeyPress = function ($event) {
            // when submit is pressed
            if (13 === $event.keyCode) {
                $event.preventDefault();
                this.addMessage();
            }
        };
        return SocialController;
    })();
    social.SocialController = SocialController;
})(social || (social = {}));
//# sourceMappingURL=SocialController.js.map