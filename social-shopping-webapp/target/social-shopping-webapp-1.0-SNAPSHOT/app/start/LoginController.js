define(['petStartModule'], function (module) {
    'use strict';

    module.controller('LoginController', ['$scope', '$location',
        'AuthenticationSharedService', '$rootScope',
        function ($scope, $location, AuthenticationSharedService, $rootScope) {
            $scope.rememberMe = true;
            $scope.login = function () {
                AuthenticationSharedService.login({
                    username: $scope.username,
                    password: $scope.password,
                    rememberMe: $scope.rememberMe,
                    success: function () {
                        $location.path($rootScope.requestedPath);
                    }
                });
            };
        }
    ]);
});
