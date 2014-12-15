define(['petCommonModule'], function (module) {
    'use strict';

    module.directive('zDatepicker', function ($filter) {
        var idCounter = 0;
        return {
            restrict: 'E',
            templateUrl: 'app/common/directive/datepicker/datepicker.html',
            replace: true,
            scope: {
                dt: '=dateTime',
                placeholder: '@',
                openedDatePicker: '=openDp'

            },
            controller: function ($scope) {

                $scope.directiveInstnaceId = idCounter++;

                $scope.today = function () {
                    $scope.dt = new Date();
                };

                $scope.showWeeks = true;
                $scope.toggleWeeks = function () {
                    $scope.showWeeks = !$scope.showWeeks;
                };

                $scope.clear = function () {
                    $scope.dt = null;
                };

                $scope.open = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.opened = !$scope.opened;

                    if ($scope.opened) {
                        $scope.openedDatePicker = $scope.directiveInstnaceId;
                    }

                };

                $scope.dateOptions = {
                    'year-format': 'yy',
                    'starting-day': 1
                };

                $scope.formats = ['dd.MM.yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
                $scope.format = $scope.formats[0];

                $scope.onKeyPress = function ($event) {
                    console.log($event);

                    // when submit is pressed
                    if (13 === $event.keyCode) {
                        $scope.opened = false;
                    }
                };

                $scope.$watch('dt', function (newObj, oldObj) {
                    if ($scope.dt) {
                        $scope.dt = $filter('date')($scope.dt, 'yyyy-MM-dd');
                    }
                }, true);

                $scope.$watch('openedDatePicker', function (newObj, oldObj) {
                    if (newObj !== oldObj) {
                        if ($scope.opened && $scope.openedDatePicker !== $scope.directiveInstnaceId) {
                            $scope.opened = false;
                        }
                    }
                }, true);
            }
        };
    });
});
