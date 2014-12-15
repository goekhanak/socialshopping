require.config({
    optimizeCss: 'none',
    baseUrl: 'app/',
    urlArgs: 't=20141211-1741',

    packages: [{
        'name': 'petCommon',
        'location': 'common'
    }, {
        'name': 'petStart',
        'location': 'start'
    }, {
        'name': 'petEnrichment',
        'location': 'enrichment'
    }, {
        'name': 'socialShopping',
        'location': 'social'
    }, {
        'name': 'petLogs',
        'location': 'logs'
    }, {
        'name': 'petMetrics',
        'location': 'metrics'
    }],

    paths: {
        appTemplates: 'templates/AppTemplates',
        angularTranslate: '../bower_components/angular-translate/angular-translate.min',
        angularTranslateLoader: '../bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min',
        angularTranslateStorageCookie: '../bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.min',
        angularTranslateStorageLocal: '../bower_components/angular-translate-storage-local/angular-translate-storage-local.min',
        jquery: '../bower_components/jquery/dist/jquery.min',
        angular: '../bower_components/angular/angular',
        angularSanitize: '../bower_components/angular-sanitize/angular-sanitize.min',
        uiBootstrap: '../bower_components/angular-bootstrap/ui-bootstrap.min',
        uiBootstrapTpls: '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        domReady: '../bower_components/domReady/domReady',
        angularResource: '../bower_components/angular-resource/angular-resource.min',
        angularRoute: '../bower_components/angular-route/angular-route.min',
        angularAnimate: '../bower_components/angular-animate/angular-animate.min',
        angularCookies: '../bower_components/angular-cookies/angular-cookies.min',
        angularHttpAuth: '../bower_components/angular-http-auth/src/http-auth-interceptor',
        ngInfiniteScroll: '../bower_components/ngInfiniteScroll/build/ng-infinite-scroll.min',
        angularBootstrapNavTree: '../bower_components/angular-bootstrap-nav-tree/dist/abn_tree_directive',
        bindonce: '../bower_components/angular-bindonce/bindonce.min',
        uiSelect: '../bower_components/angular-ui-select/dist/select.min',
        lodash: '../bower_components/lodash/dist/lodash.min',
        angularLoadingBar: '../bower_components/angular-loading-bar/build/loading-bar.min',
        firebase: '../bower_components/firebase/firebase.js',
        angularfire: '../bower_components/angularfire/dist/angularfire.js'

    },

    shim: {
        appTemplates: {
            deps: ['angular']
        },
        angularTranslate: {
            deps: ['angular']
        },
        angularTranslateLoader: {
            deps: ['angular', 'angularTranslate']
        },
        angularTranslateStorageCookie: {
            deps: ['angular', 'angularTranslate']
        },
        angularTranslateStorageLocal: {
            deps: ['angular', 'angularTranslate', 'angularTranslateStorageCookie']
        },
        angular: {
            deps: ['jquery'],
            exports: 'angular'
        },
        angularHttpAuth: {
            deps: ['angular']
        },
        uiBootstrap: {
            deps: ['angular']
        },
        uiBootstrapTpls: {
            deps: ['angular']
        },
        angularResource: {
            deps: ['angular'],
            exports: 'ngResource'
        },
        angularSanitize: {
            deps: ['angular']
        },
        angularRoute: {
            deps: ['angular'],
            exports: 'ngRoute'
        },
        angularAnimate: {
            deps: ['angular']
        },
        angularCookies: {
            deps: ['angular'],
            exports: 'ngCookies'
        },
        ngInfiniteScroll: {
            deps: ['angular']
        },
        angularBootstrapNavTree: {
            deps: ['angular', 'angularAnimate']
        },
        bindonce: {
            deps: ['angular']
        },
        uiSelect: {
            deps: ['angular']
        },
        angularLoadingBar: {
            deps: ['angular', 'angularAnimate']
        },
        angularfire: {
            deps: ['angular', 'firebase']
        }
    }
});
