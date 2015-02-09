/// <reference path='../../_all.ts' />


define(['socialShoppingModule'], function (socialModule) {
    'use strict';


    socialModule.controller('SocialController', ['$scope','$injector',
        function($scope,$injector){
            return new social.SocialController($scope, $injector);
        }
    ]);
});

module social{
    export class SocialController{
        private $firebase;
        private $firebaseAuth;
        private $log : ng.ILogService;
        private cons;
        private $rootScope;
        private Firebase ;
        private shopService: social.ShopService;

        filterCriteria: ArticleFilterCriteria;
        CommentExpanded: Array<String>;
        targetGroups: Array<TargetGroup>;
        targetGroup: TargetGroup;
        categories: Array<Category>;
        searchedArticles: Array<Article>
        articles: AngularFireArray;
        participants: any;
        messages: any;
        newMessage: string;
        newComment: Array<String>;

        constructor($scope, $injector){
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

            $scope.calculateThumbs = (article: RatedArticle) =>{
                return (article.thumbsDown ? article.thumbsDown.length : 0) - (article.thumbsUp ? article.thumbsUp.length : 0);
            };

            $scope.$on('$destroy',  () => {
                for (var i = 0; i < this.participants.length; i++) {
                    var participant = this.participants[i];
                    if (participant.id === this.$rootScope.currentFBUser.id) {
                        this.participants.$remove(participant);
                    }
                }
            });
        }

        private connectToFirebase() {
            var firebaseRef = new Firebase(this.cons.FIREBASE_BASE_URL);
            var authObj = this.$firebaseAuth(firebaseRef);

            authObj.$authWithOAuthPopup('facebook').then((authData) => {
                this.$log.debug('Logged in as:', authData);

                var messagesRef = firebaseRef.child('messages');
                var messagesSync = this.$firebase(messagesRef);
                this.messages = messagesSync.$asArray();

                var participantsRef = firebaseRef.child('participants');
                var participantsSync = this.$firebase(participantsRef);
                this.participants = participantsSync.$asArray();

                var articlesRef = firebaseRef.child('articles');
                var articlesSync = this.$firebase(articlesRef);
                this.articles = articlesSync.$asArray();

                this.participants.$loaded( () => {
                    var userExists = false;
                    for (var i = 0; i < this.participants.length; i++) {
                        var participant = this.participants[i];
                        if (participant.id === this.$rootScope.currentFBUser.id) {
                            userExists = true;
                        }
                    }

                    if (userExists === false) {
                        this.participants.$add(this.$rootScope.currentFBUser);
                    }
                },  (error) => {
                    this.$log.error('Error:', error);
                });

                this.$rootScope.currentFBUser.displayName = authData.facebook.displayName;
                this.$rootScope.currentFBUser.profilePicture = authData.facebook.cachedUserProfile.picture.data.url;
                this.$rootScope.currentFBUser.id = authData.facebook.id;
            }).catch((error) =>{
                console.error('Authentication failed:', error);
            });
        }

        private loadMasterData() {
            this.targetGroups = this.shopService.getTargetGroups();

            angular.forEach(this.targetGroups, (targetGroup: social.TargetGroup) => {
                this.$log.debug('targetGroup.code: ' + targetGroup.code, + 'targetGroup.name: ' + targetGroup.name);
            });
        }

        onTargetGroupChange(targetGroup) {
            this.targetGroup = targetGroup;

            this.$log.debug('Target Group selected: ', targetGroup);

            this.shopService.getCategories(targetGroup.code).$promise.then( (result) => {
                this.categories = result.content;
            },
            //error
            function (error) {
                this.$log.error('getCategories failed with targetGroup: :', targetGroup);
            });
        }


        onSearchFilterKeyPress($event) {
            // when submit is pressed
            if (13 === $event.keyCode) {
                $event.preventDefault();
                this.searchArticles();
            }
        }

        searchArticles() {
            var filter = {
                category: this.filterCriteria.category.key,
                fullText: this.filterCriteria.articleName
            };

            this.shopService.searchArticles(filter).$promise.then((result:social.ArticleSearchResult) => {
                    this.searchedArticles = result.content;
                },
                //error
                (error) => {
                    this.$log.error('searchArticles failed with filter: :', filter);
                }
            );
        }

        addArticle(article: Article) {
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
        }

        removeArticle(articleToRemove) {
            for (var i = 0; i < this.articles.length; i++) {
                var article = this.articles[i] ;
                if (article.$id === articleToRemove.$id) {
                    this.articles.$remove(article);
                }
            }
        }

        articleThumpsUpped(article: RatedArticle) {
            if (!article.thumbsUp) {
                return false;
            }

            return article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id) > -1;
        }

        articleThumpsDowned(article : RatedArticle) {
            if (!article.thumbsDown) {
                return false;
            }

            return article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id) > -1;
        }

        thumpsUp(article: RatedArticle) {
            if (!article.thumbsUp) {
                this.$log.debug('No thumbsUp array exists!');
                article.thumbsUp = [this.$rootScope.currentFBUser.id];
            } else if (article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id) < 0) {
                article.thumbsUp.push(this.$rootScope.currentFBUser.id);
            } else {
                article.thumbsUp.splice(article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id), 1);
            }

            // Remove yourself from thumbsDown if exists
            if (article.thumbsDown && article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id) > -1) {
                article.thumbsDown.splice(article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id), 1);
            }

            this.articles.$save(article);
        }

        thumpsDown(article : RatedArticle) {
            if (!article.thumbsDown) {
                this.$log.debug('No thumbsDown array exists!');
                article.thumbsDown = [this.$rootScope.currentFBUser.id];
            } else if (article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id) < 0) {
                article.thumbsDown.push(this.$rootScope.currentFBUser.id);
            } else {
                article.thumbsDown.splice(article.thumbsDown.indexOf(this.$rootScope.currentFBUser.id), 1);
            }

            // Remove yourself from thumbsDown if exists
            if (article.thumbsUp && article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id) > -1) {
                article.thumbsUp.splice(article.thumbsUp.indexOf(this.$rootScope.currentFBUser.id), 1);
            }

            this.articles.$save(article);
        }



        toggleExpandComments(article:RatedArticle) {
            if (!this.CommentExpanded[article.id]) {
                this.CommentExpanded[article.id] = true;
            } else {
                this.CommentExpanded[article.id] = false;
            }
        }

        onCommentKeyPress(article: RatedArticle, $event) {
            // when submit is pressed
            if (13 === $event.keyCode) {
                $event.preventDefault();
                this.addComment(article);
            }
        }

        addComment(article: RatedArticle) {
            if (!article.comments) {
                article.comments = [];
            }

            article.comments.push({
                content: this.newComment[article.id],
                postedBy: this.$rootScope.currentFBUser.displayName, // get it from facebook login
                postedDate: Date.now(),
                userImg: this.$rootScope.currentFBUser.profilePicture
            });

            // synchronize with server
            this.articles.$save(article);
            this.newComment[article.id] = null;
        }

        addMessage() {
            this.messages.$add({
                content: this.newMessage,
                postedBy: this.$rootScope.currentFBUser.displayName, // get it from facebook login
                postedDate: Date.now(),
                userImg: this.$rootScope.currentFBUser.profilePicture
            });
            this.newMessage = null;
        }

        onMessageKeyPress($event) {
            // when submit is pressed
            if (13 === $event.keyCode) {
                $event.preventDefault();
                this.addMessage();
            }
        }


    }
}