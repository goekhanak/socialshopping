/// <reference path='../../_all.ts' />

define(['socialShoppingModule'], function (module) {
    'use strict';

    module.factory('ShopService', ['$injector',

        function($injector){
            return new social.ShopService($injector);
        }
    ]);
});

module social {
    export class ShopService {
        private $resource: ng.resource.IResourceService;
        private SHOP_API_URL: string = 'https://api.zalando.com/';

        constructor(private $injector) {
            this.$resource = $injector.get('$resource');
        }

        searchArticles(searchRequest): social.ArticleSearchResult {
            var connection:any = this.$resource(this.SHOP_API_URL + 'articles', {}, {
                query: {
                    method: 'GET',
                    isArray: false,
                    cache: true
                }
            });

            return connection.query(searchRequest);
        }

        getTargetGroups():Array<social.TargetGroup> {
            var targetGroups:Array<social.TargetGroup> = new Array<social.TargetGroup>();

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

        getCategories(targetGroupCode): social.CategorySearchResult {
            var filter = {
                targetGroup: targetGroupCode,
                hidden: false,
                outlet: false,
                //parentKey: targetGroupCode,
                pageSize: 999
            };


            var connection:any = this.$resource(this.SHOP_API_URL + 'categories', {}, {
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
