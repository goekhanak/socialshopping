define(['petLogsModule'], function (module) {
    'use strict';

    module.controller('LogsController', ['$scope', 'LogsService',
        function ($scope, LogsService) {
            var self = this;

            $scope.$load(
                LogsService.findAll(),
                function (results) {
                    self.loggers = results;
                }
            );

            $scope.changeLevel = function (name, level) {
                LogsService.changeLevel({
                    name: name,
                    level: level
                }, function () {
                    $scope.$load(
                        LogsService.findAll(),
                        function (results) {
                            self.loggers = results;
                        }
                    );
                });
            };
        }
    ]);
});
