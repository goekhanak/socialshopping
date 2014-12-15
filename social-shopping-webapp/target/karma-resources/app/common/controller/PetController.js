define(['petCommonModule'], function (module) {
    'use strict';

    module.controller('PetController', [
        '$scope',
        '$rootScope',
        '$parse',
        '$translate',
        '$location',
        '$log',
        'AuthenticationSharedService',
        'UserService',
        'cons',
        function ($scope, $rootScope, $parse, $translate, $location, $log, AuthenticationSharedService, UserService, cons) {

            $rootScope.requestedPath = '/';

            function init() {
                $scope.lang = $translate.proposedLanguage();
                $scope.changeLanguage = function changeLanguage(languageKey) {
                    $scope.lang = $translate.use(languageKey);
                };
                bind();
            }

            function permit(permission) {
                if (permission === cons.PRIVILEGE_ADMIN) {
                    return $scope.isUserAdmin;
                } else if (permission === cons.PRIVILEGE_EDIT) {
                    return $scope.canUserEdit;
                } else {
                    $log.error('permission: ' + permission + '  is not defined!');
                    return false;
                }
            }

            function permitRoute(permission) {
                if (permission) {
                    // else always allowed

                    var allowed = permit(permission);
                    if (!allowed) {
                        $location.url(cons.accessDeniedSuffix);
                    }
                }
            }

            function bind() {
                $scope.cons = cons;

                $rootScope.$on('$routeChangeStart', function (event, next, current) {
                    // Check if the status of the user. Is it authenticated or not?
                    if (next.originalPath !== '/logout') {
                        AuthenticationSharedService.authenticate({}, function () {
                            $scope.authenticated = true;
                        }, function () {
                            $scope.authenticated = false;
                        });
                    }

                    var permission = next.$$route ? next.$$route.permission : false;

                    // it may be the case that we try to access a url
                    // for the first time while we're still logged in
                    // think refreshing...
                    // that means we haven't fetched our user information yet then

                    if ($scope.currentUser) {
                        if (!$scope.currentUser.$resolved && $scope.currentUser.then) {
                            // so we wait for it
                            $scope.currentUser.then(function () {
                                permitRoute(permission);
                            });
                        } else {
                            // or do the check RIGHT NOW
                            permitRoute(permission);
                        }
                    }
                });

                // Call when the 401 response is returned by the client
                $rootScope.$on('event:auth-loginRequired', function (rejection) {
                    $scope.authenticated = false;
                    $location.path('/login').replace();
                });

                $rootScope.$on('event:auth-authConfirmed', function () {
                    $scope.authenticated = true;

                    if(!$scope.currentUser) {
                        $log.info('succesfully logged in and no currentUser object was defined');
                        createSession();
                    }
                    // If the login page has been requested and the user is already logged in
                    // the user is redirected to the home page
                    if ($location.path() === '/login') {
                        $location.path('/').replace();
                    }
                });

                // Call when the user logs in
                $rootScope.$on('event:auth-loginConfirmed', function () {
                    $scope.authenticated = true;
                    createSession();
                });
                // Call when the user logs out
                $rootScope.$on('event:auth-loginCancelled', function () {
                    $scope.authenticated = false;
                    $scope.currentUser = false;
                    $location.path('/login');
                });
            }

            // Call when the user is authenticated
            function createSession() {
                $scope.currentUser = $scope.$load(UserService.get(), function (user) {
                    $scope.currentUser = {
                        'username': user.username,
                        'permissions': user.authorities
                    };

                    $scope.canUserEdit = false;
                    $scope.isUserAdmin = false;
                    angular.forEach(user.authorities, function (privilege) {
                        if (cons.PRIVILEGE_EDIT === privilege.authority) {
                            $scope.canUserEdit = true;
                        } else if (cons.PRIVILEGE_ADMIN === privilege.authority) {
                            $scope.isUserAdmin = true;
                        }
                    });
                });
            }

            init();
        }
    ]);
});
