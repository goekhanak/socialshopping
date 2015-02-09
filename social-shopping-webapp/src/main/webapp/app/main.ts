/// <reference path='_all.ts' />

//import angularRoute = require('angular-route');
//import angularResource = require('angular-resource');
//import angularUiBootstrap = require('angular-ui-bootstrap');

define('petModule', [
        'angular',
        'uiBootstrap',
        'uiBootstrapTpls',
        'angularRoute',
        'angularResource',
        'angularCookies',
        'angularTranslateStorageLocal',
        'angularTranslateStorageCookie',
        'angularTranslateLoader',
        'angularTranslate',
        'angularAnimate',
        'angularHttpAuth',
        'appTemplates',
        'petEnrichment',
        'socialShopping',
        'petStart',
        'ngInfiniteScroll',
        'angularBootstrapNavTree',
        'bindonce',
        'petLogs',
        'petMetrics',
        'uiSelect',
        'angularLoadingBar',
        'angularfire'
    ],
    function (angular:ng.IAngularStatic) {
        'use strict';

        return angular.module('pet', [
            'ui.bootstrap',
            'ui.bootstrap.tpls',
            'ngResource',
            'ngRoute',
            'ngCookies',
            'ngAnimate',
            'pascalprecht.translate',
            'http-auth-interceptor',
            'appTemplates',
            'petEnrichment',
            'socialShopping',
            'petStart',
            'infinite-scroll',
            'angularBootstrapNavTree',
            'pasvaz.bindonce',
            'petLogs',
            'petMetrics',
            'ui.select',
            'angular-loading-bar',
            'firebase'
        ]);
    }
);

// this is the actual pet module
define('pet', ['petModule'],
    function (module) {
        'use strict';

        // configure our routes
        module.config(['$routeProvider', 'cons',
            function ($routeProvider, cons) {
                $routeProvider
                    .when('/start', {
                        templateUrl: 'app/start/main.html',
                        label: 'Start'

                    })
                    .when('/login', {
                        templateUrl: 'app/start/login.html',
                        label: 'Login',
                        controller: 'LoginController'
                    })
                    .when('/enrichment', {
                        templateUrl: 'app/enrichment/main.html',
                        label: 'Enrichment',
                        permission: cons.PRIVILEGE_EDIT
                    })
                    .when('/social', {
                        templateUrl: 'app/social/social.html',
                        label: 'Social',
                        permission: cons.PRIVILEGE_EDIT
                    })
                    .when('/docs', {
                        templateUrl: 'app/common/swagger-ui/main.html',
                        label: 'Docs',
                        permission: cons.PRIVILEGE_ADMIN
                    })
                    .when('/logs', {
                        templateUrl: 'app/logs/main.html',
                        label: 'Logs',
                        permission: cons.PRIVILEGE_ADMIN
                    })
                    .when('/metrics', {
                        templateUrl: 'app/metrics/main.html',
                        label: 'Metrics',
                        permission: cons.PRIVILEGE_ADMIN
                    })
                    .when('/logout', {
                        templateUrl: 'app/start/login.html',
                        label: 'Logout',
                        controller: 'LogoutController'
                    })
                    .when(cons.accessDeniedSuffix, {
                        templateUrl: 'app/common/view/403.html',
                        label: '403'
                    })
                    .otherwise({
                        redirectTo: '/social',
                        permission: cons.PRIVILEGE_EDIT
                    });
            }
        ]);

        // load translations and set preferred language
        module.config(['$translateProvider',
            function ($translateProvider) {
                $translateProvider.useStaticFilesLoader({
                    prefix: 'i18n/',
                    suffix: '.json?t=${buildTime}'
                });
                $translateProvider.preferredLanguage('de');
                // falls back to cookies if unavailable
                $translateProvider.useLocalStorage();
            }
        ]);

        return module;
    }
);

require(['app/config.js?t=${buildTime}'], function () {
    'use strict';

    require(['angular', 'domReady', 'pet'], function (angular, domReady) {
        domReady(function () {
            var $body = $('body');
            //            $body.attr('data-ng-app', 'pet');
            // start the application as soon as the dom is ready
            angular.bootstrap($body, ['pet']);
        });
    });
});
