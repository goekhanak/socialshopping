define(['petCommonModule'], function (module) {
    'use strict';

    module.factory('AuthenticationSharedService', ['$rootScope', '$http',
        'authService', 'cons',
        function ($rootScope, $http, authService, cons) {

            return {
                authenticate: function () {
                    $http.get(cons.REST_BASE_URL + '/authenticate')
                        .success(function (data, status, headers, config) {
                            $rootScope.login = data;
                            if (data === '') {
                                $rootScope.$broadcast('event:auth-loginRequired');
                            } else {
                                $rootScope.$broadcast('event:auth-authConfirmed');
                            }
                        });
                },
                login: function (param) {
                    var data = 'j_username=' + param.username + '&j_password=' + param.password +
                        '&_spring_security_remember_me=' + param.rememberMe + '&submit=Login';
                    $http.post('authentication', data, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        ignoreAuthModule: 'ignoreAuthModule'
                    }).success(function (data, status, headers, config) {
                        $rootScope.authenticationError = false;
                        authService.loginConfirmed();
                        if (param.success) {
                            param.success(data, status, headers, config);
                        }
                    }).error(function (data, status, headers, config) {
                        console.log('auth error');
                        $rootScope.authenticationError = true;
                        if (param.error) {
                            param.error(data, status, headers, config);
                        }
                    });
                },
                logout: function () {
                    $rootScope.authenticationError = false;
                    $http.get('logout')
                        .success(function (data, status, headers, config) {
                            $rootScope.login = null;
                            authService.loginCancelled();
                        });
                },

                hasPrivilege: function (privelegeName, cb) {

                    var checkHasPrivilege = function (privelegeName, cb) {
                        if ($rootScope.user === false) {
                            cb(false);
                            return;
                        }

                        $rootScope.user.$promise.then(
                            //success
                            function (result) {
                                var privileges = result.authorities;
                                for (var i = 0; i < privileges.length; i++) {
                                    var privilege = privileges[i];
                                    if (privilege.authority === privelegeName) {
                                        cb(true);
                                        return;
                                    }
                                }

                                cb(false);
                            }
                        );
                    };

                    if ($rootScope.user === undefined) {
                        var unregister = $rootScope.$watch('$rootScope.user', function () {

                            if ($rootScope.user !== undefined) {
                                checkHasPrivilege(privelegeName, cb);
                                unregister();
                                return;
                            }
                        });
                    } else {
                        checkHasPrivilege(privelegeName, cb);
                    }
                }
            };

        }
    ]);
});
