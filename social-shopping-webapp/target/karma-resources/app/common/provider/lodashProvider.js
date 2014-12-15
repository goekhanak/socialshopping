define(['petCommonModule', 'lodash'], function (module) {
    'use strict';

    module.factory('lodash', [

        function () {

            var ld = window._;

            var diff = function (array, values, comparator) {
                var length = array ? array.length : 0;
                if (!length) {
                    return [];
                }

                var comparatorFn, accessorFn;
                if (typeof comparator === 'string') {
                    // if there is a string property as comparator, we use it to access the value
                    // and compare via ===
                    accessorFn = function (d) {
                        return d[comparator];
                    };
                    comparatorFn = ld.isEqual;
                } else if (typeof comparator === 'function') {
                    // if comparator is a function, we use it to compare two objects
                    // values are accessed via identity function
                    accessorFn = ld.identity;
                    comparatorFn = comparator;
                } else if (typeof comparator === 'undefined') {
                    // if there is no comparator, access by identity and compare via ===
                    accessorFn = ld.identity;
                    comparatorFn = ld.isEqual;
                } else {
                    throw new Error('Illegal comparator type. Must be string or function.');
                }

                var idx = -1,
                    result = [],
                    valuesLength = values ? values.length : 0;

                // iterate
                outer:
                while (++idx < length) {
                    var item = array[idx];
                    var valuesIndex = valuesLength;
                    while (valuesIndex--) {
                        if (comparatorFn(accessorFn(values[valuesIndex]), accessorFn(item))) {
                            // continue with next index if this value is in both arrays
                            continue outer;
                        }
                    }
                    // if this value is not in values array, add it to result
                    result.push(item);
                }
                return result;
            };

            ld.mixin({
                'diff': diff
            });

            return ld;
        }
    ]);
});
