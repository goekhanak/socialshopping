define(['petCommonModule'], function (module) {
    'use strict';

    module.filter('formatter', [
        '$injector',
        function ($injector) {
            return function (input, propertyString) {

                if (propertyString) {
                    return $injector.get(propertyString)(input);
                }
                return input;
            };
        }
    ]);
});
