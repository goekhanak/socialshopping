define(['petCommonModule'], function (module) {
    'use strict';

    module.factory('UserService', ['$resource', 'cons',
        function ($resource, cons) {
            return $resource(cons.REST_BASE_URL + '/user');
        }
    ]);
});
