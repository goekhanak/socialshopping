define(['petCommonModule'], function (module) {
    'use strict';
    module.factory('ShopService', ['$injector',
        function ($injector) {
            var $resource = $injector.get('$resource');
            var SHOP_API_URL = 'https://api.zalando.com/';
            var self = this;
            self.cachedAttributeDefinitions = {};
            function searchArticles(searchRequest) {
                var connection = $resource(SHOP_API_URL + 'articles', {}, {
                    query: {
                        method: 'GET',
                        isArray: false,
                        cache: true
                    }
                });
                return connection.query(searchRequest);
            }
            function getTargetGroups() {
                return [{
                    code: 'women',
                    name: 'Women'
                }, {
                    code: 'men',
                    name: 'Men'
                }, {
                    code: 'kids',
                    name: 'Kids'
                }];
            }
            function getCategoriesTry(targetGroupCode) {
                var connection = $resource(SHOP_API_URL + 'categories/' + targetGroupCode, {}, {
                    query: {
                        method: 'GET',
                        isArray: false,
                        cache: true
                    }
                });
                return connection.query();
            }
            function getCategories(targetGroupCode) {
                var filter = {
                    targetGroup: targetGroupCode,
                    hidden: false,
                    outlet: false,
                    //parentKey: targetGroupCode,
                    pageSize: 999
                };
                var connection = $resource(SHOP_API_URL + 'categories', {}, {
                    query: {
                        method: 'GET',
                        isArray: false,
                        cache: true
                    }
                });
                return connection.query(filter);
            }
            self.searchArticles = searchArticles;
            self.getTargetGroups = getTargetGroups;
            self.getCategories = getCategories;
            return self;
        }]);
});