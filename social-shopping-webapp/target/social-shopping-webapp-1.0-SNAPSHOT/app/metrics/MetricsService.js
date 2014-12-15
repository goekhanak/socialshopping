define(['petMetricsModule'], function (module) {
    'use strict';

    module.factory('MetricsService', ['$resource',
        function ($resource) {
            return $resource('metrics/metrics', {}, {
                'get': {
                    method: 'GET'
                }
            });
        }
    ]);
});
