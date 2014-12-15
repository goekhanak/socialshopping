define(['petStartModule'], function (module) {
    'use strict';

    module.controller('LogoutController', ['$location',
        'AuthenticationSharedService',
        function ($location, AuthenticationSharedService) {
            AuthenticationSharedService.logout({
                success: function () {
                    $location.path('/login');
                }
            });
        }
    ]);
});
