/// <reference path='../../_all.ts' />

define(['petCommonModule'], function (module) {
    'use strict';


        //define(['petCommonModule'], function (module) {
        //    module.factory('ShopService', ['$injector', ShopService]);
        //});



});

module petCommon
{
    class ShopServiceType {
        private $resource:ng.resource.IResourceService;
        private SHOP_API_URL:string = 'https://api.zalando.com/';

        constructor(private $injector) {
            this.$resource = $injector.get('$resource');
        }

        searchArticles(searchRequest) {
            var connection = this.$resource(this.SHOP_API_URL + 'articles', {}, {
                query: {
                    method: 'GET',
                    isArray: false,
                    cache: true
                }
            });

            return connection.query(searchRequest);
        }

        getTargetGroups():Array<TargetGroup> {
            var targetGroups:Array<TargetGroup> = new Array<TargetGroup>();

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
        }

        getCategoriesTry(targetGroupCode) {

            var connection = this.$resource(this.SHOP_API_URL + 'categories/' + targetGroupCode, {}, {
                query: {
                    method: 'GET',
                    isArray: false,
                    cache: true
                }
            });
            return connection.query();
        }

        getCategories(targetGroupCode) {
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
        }
    }
}


