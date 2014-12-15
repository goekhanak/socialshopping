define(['petMetricsModule'], function (module) {
    'use strict';

    module.controller('MetricsController', ['$scope',
        'HealthCheckService', 'MetricsService',
        function ($scope, HealthCheckService, MetricsService) {

            $scope.metrics = MetricsService.get();
            HealthCheckService.check();

            $scope.metrics.$get({}, function (items) {
                $scope.servicesStats = {};
                $scope.cachesStats = {};
                angular.forEach(items.timers, function (value, key) {
                    if (key.indexOf('performance') !== -1) {
                        $scope.servicesStats[key] = value;
                    }

                    if (key.indexOf('net.sf.ehcache.Cache') !== -1) {
                        // remove gets or puts
                        var index = key.lastIndexOf('.');
                        var newKey = key.substr(0, index);

                        // Keep the name of the domain
                        index = newKey.lastIndexOf('.');
                        $scope.cachesStats[newKey] = {
                            'name': newKey.substr(index + 1),
                            'value': value
                        };
                    }
                });
            });
        }
    ]);
});
