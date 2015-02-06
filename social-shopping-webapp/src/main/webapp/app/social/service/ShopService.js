/// <reference path='../../_all.ts' />
define(['socialShoppingModule'], function (module) {
    'use strict';
    module.factory('ShopService', ['$injector', function ($injector) {
        return new social.ShopService($injector);
    }]);
});
var social;
(function (social) {
    var ShopService = (function () {
        function ShopService($injector) {
            this.$injector = $injector;
            this.SHOP_API_URL = 'https://api.zalando.com/';
            this.$resource = $injector.get('$resource');
        }
        ShopService.prototype.searchArticles = function (searchRequest) {
            var connection = this.$resource(this.SHOP_API_URL + 'articles', {}, {
                query: {
                    method: 'GET',
                    isArray: false,
                    cache: true
                }
            });
            return connection.query(searchRequest);
        };
        ShopService.prototype.getTargetGroups = function () {
            var targetGroups = new Array();
            targetGroups.push({
                code: 'women',
                name: 'Women'
            });
            targetGroups.push({
                code: 'men',
                name: 'Men'
            });
            targetGroups.push({
                code: 'kids',
                name: 'Kids'
            });
            return targetGroups;
        };
        ShopService.prototype.getCategories = function (targetGroupCode) {
            var filter = {
                targetGroup: targetGroupCode,
                hidden: false,
                outlet: false,
                //parentKey: targetGroupCode,
                pageSize: 999
            };
            var connection = this.$resource(this.SHOP_API_URL + 'categories', {}, {
                query: {
                    method: 'GET',
                    isArray: false,
                    cache: true
                }
            });
            return connection.query(filter);
        };
        return ShopService;
    })();
    social.ShopService = ShopService;
})(social || (social = {}));
//# sourceMappingURL=ShopService.js.map