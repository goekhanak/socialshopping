define('config', [], function () {
    'use strict';

    require.config({
        // Karma serves files from '/base'
        baseUrl: '/base/app',

        packages: [
            {
                name: 'petCommon',
                location: 'common'
            },
            {
                name: 'petStart',
                location: 'start'
            },
            {
                name: 'petEnrichment',
                location: 'enrichment'
            }
        ],

        paths: {
            jquery: '../bower_components/jquery/dist/jquery.min',
            domReady: '../bower_components/domReady/domReady',
            angularAnimate: '../bower_components/angular-animate/angular-animate',
            angular: '../bower_components/angular/angular',
            angularMocks: '../bower_components/angular-mocks/angular-mocks',
            ngResource: '../bower_components/angular-resource/angular-resource',
            angularRoute: '../bower_components/angular-route/angular-route',
            angularSanitize: '../bower_components/angular-sanitize/angular-sanitize',
            angularTranslate: '../bower_components/angular-translate/angular-translate',
            petTemplates: 'templates/PetTemplates',
            uiBootstrap: '../bower_components/angular-bootstrap/ui-bootstrap',
            lodash: '../bower_components/lodash/dist/lodash'
        },

        shim: {
            angular: {
                deps: ['jquery'],
                exports: 'angular'
            },
            uiBootstrap: {
                deps: ['angular']
            },
            angularMocks: {
                deps: ['ngResource'],
                exports: 'angularMocks'
            },
            ngResource: {
                deps: ['angular'],
                exports: 'ngResource'
            },
            angularRoute: {
                deps: [ 'angular' ],
                exports: 'ngRoute'
            },
            angularTranslate: {
                deps: ['angular']
            },
            petTemplates: {
                deps: ['angular']
            },
            lodash: {
                exports: '_'
            }
        }
    });
});

define('petTestsModule', ['angular', 'petCommon', 'petTemplates'], function (angular) {
    'use strict';
    return angular.module('petTests', ['petCommon', 'petTemplates']);
});
define('petTests', ['petTestsModule'], function (module) {
    'use strict';
    return module;
});

require(['config'], function () {
    'use strict';
    var tests = [];
    for (var file in window.__karma__.files) {
        if (window.__karma__.files.hasOwnProperty(file)) {
            if (/spec\.js$/i.test(file)) {
                console.log(file);
                tests.push(file);
            }
        }
    }

    require(tests, function () {
        console.log('starting karma');
        window.__karma__.start();
    });
});
