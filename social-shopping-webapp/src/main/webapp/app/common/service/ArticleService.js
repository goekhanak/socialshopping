define(['petCommonModule'], function (module) {
    'use strict';

    module.factory('ArticleService', [
        '$resource',
        'cons',
        'BackendPagination',
        function ($resource, cons, BackendPagination) {

            var ARTICLE_URL = cons.REST_BASE_URL + '/article/';

            var service = {

                search : function(searchRequest){
                    var connection = $resource(ARTICLE_URL , {}, {
                        query: {
                            method: 'GET',
                            isArray: true
                            //transformResponse: BackendPagination.getContent
                        }
                    });

                    return connection.query(searchRequest);
                },

                get: function(modelSku){
                    var connection = $resource(ARTICLE_URL + modelSku, {}, {
                        query: {
                            method: 'GET',
                            isArray: false
                        }
                    });

                    return connection.query();
                },

                submit: function(modelSku){
                    var connection = $resource(ARTICLE_URL + 'submit/' + modelSku, {}, {
                        put: {
                            method: 'PUT',
                            isArray: false
                        }
                    });

                    return connection.put();
                }

            };
            return service;
        }
    ]);
});
