define(['petCommonModule'], function (module) {
    'use strict';

    module.run(['$rootScope', '$q',
        function init($rootScope, $q) {

            var Scope = $rootScope.constructor;

            // convenient loading
            Scope.prototype.$load = function $load(request, valueProperty, loadingProperty,
                errorProperty) {
                var scope = this;

                function setValue(value) {
                    if (valueProperty) {
                        if (angular.isFunction(valueProperty)) {
                            valueProperty(value);
                        } else {
                            scope.$eval(valueProperty + ' = $value', {
                                $value: value
                            });
                        }
                    }
                }

                function setLoading(value) {
                    if (loadingProperty) {
                        if (angular.isFunction(loadingProperty)) {
                            loadingProperty(value);
                        } else {
                            scope.$eval(loadingProperty + ' = $value', {
                                $value: value
                            });
                        }
                    }
                }

                function setError(value) {
                    if (errorProperty) {
                        if (angular.isFunction(errorProperty)) {
                            errorProperty(value);
                        } else {
                            scope.$eval(errorProperty + ' = $value', {
                                $value: value
                            });
                        }
                    }
                }

                setLoading(true);
                setError(false);
                var then = request.then || request.$promise.then,
                    promise = $q.defer();

                then(function success(result) {
                    setLoading(false);
                    setValue(result);
                    promise.resolve(result);
                }, function error(errorData) {
                    setLoading(false);
                    setError(errorData);
                    promise.reject(errorData);
                });

                return promise.promise;
            };
        }
    ]);
});
