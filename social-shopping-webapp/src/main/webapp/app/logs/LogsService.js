define(['petLogsModule'], function (module) {
    'use strict';

    module.factory('LogsService', ['$resource',
        function ($resource) {
            return $resource('rest/logs', {}, {
                'findAll': {
                    method: 'GET',
                    isArray: true
                },
                'changeLevel': {
                    method: 'PUT'
                }
            });
        }
    ]);
});
