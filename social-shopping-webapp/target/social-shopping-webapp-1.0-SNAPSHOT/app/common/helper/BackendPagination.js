define(['petCommonModule'], function (module) {
    'use strict';

    module.factory('BackendPagination', [

        function () {

            function getContent(pageable) {
                return JSON.parse(pageable).content;
            }

            function buildRequest(userParams) {
                var params = angular.copy(userParams);
                delete params.filterBy;
                delete params.sortDesc;
                delete params.sortBy;
                params.page = userParams.page || 0;
                params.pageSize = userParams.size || 20;
                params.sortProperty = userParams.sortBy;
                params.sortDirection = userParams.sortDesc ? 'DESC' : 'ASC';

                if (userParams.filterBy) {
                    angular.forEach(userParams.filterBy, function (value, key) {
                        params[key] = value;
                    });
                }
                return params;
            }

            return {
                'getContent': getContent,
                'buildRequest': buildRequest
            };
        }
    ]);
});
