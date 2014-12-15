define(['petMetricsModule'], function (module) {
    'use strict';

    module.factory('HealthCheckService', ['$rootScope', '$http',
        function ($rootScope, $http) {
            return {
                check: function () {
                    $http.get('health')
                        .success(function (data, status, headers, config) {
                            $rootScope.healthCheck = data;
                        })
                        .error(function (data, status, headers, config) {
                            $rootScope.healthCheck = data;
                        });
                }
            };
        }
    ]);
});
