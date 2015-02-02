/// <reference path='../../_all.ts' />
define(['petCommonModule'], function (module) {
    'use strict';
    //define(['petCommonModule'], function (module) {
    //    module.factory('ShopService', ['$injector', ShopService]);
    //});
});
var petCommon;
(function (petCommon) {
    var ShopServiceType = (function () {
        function ShopServiceType($injector) {
            this.$injector = $injector;
            this.SHOP_API_URL = 'https://api.zalando.com/';
            this.$resource = $injector.get('$resource');
        }
        ShopServiceType.prototype.searchArticles = function (searchRequest) {
            var connection = this.$resource(this.SHOP_API_URL + 'articles', {}, {
                query: {
                    method: 'GET',
                    isArray: false,
                    cache: true
                }
            });
            return connection.query(searchRequest);
        };
        ShopServiceType.prototype.getTargetGroups = function () {
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
        ShopServiceType.prototype.getCategoriesTry = function (targetGroupCode) {
            var connection = this.$resource(this.SHOP_API_URL + 'categories/' + targetGroupCode, {}, {
                query: {
                    method: 'GET',
                    isArray: false,
                    cache: true
                }
            });
            return connection.query();
        };
        ShopServiceType.prototype.getCategories = function (targetGroupCode) {
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
        return ShopServiceType;
    })();
})(petCommon || (petCommon = {}));
//# sourceMappingURL=ShopServiceType.js.map