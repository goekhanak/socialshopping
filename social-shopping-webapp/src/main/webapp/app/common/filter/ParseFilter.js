define(['petCommonModule'], function (module) {
    'use strict';

    module.filter('parse', [
        '$parse',
        function ($parse) {
            // cache dem parsers
            var cache = {};
            return function (object, propertyString) {
                if (!cache[propertyString]) {
                    cache[propertyString] = $parse(propertyString);
                }
                return cache[propertyString](object);
            };
        }
    ]);
});
