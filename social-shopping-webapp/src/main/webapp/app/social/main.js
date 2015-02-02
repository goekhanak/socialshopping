/// <reference path='../_all.ts' />
/// <amd-dependency path="angular"/>
//export module socialShoppingModule{
//    var angular:ng.IAngularStatic = require('angular');
//    var petCommon = require('../common/main');
//
//    export function run() {
//        return angular.module('socialShopping', ['petCommon']);
//    }
//}
define('socialShoppingModule', ['angular', 'petCommon'], function (angular) {
    'use strict';
    return angular.module('socialShopping', ['petCommon']);
});
define('socialShopping', ['socialShoppingModule', './SocialController'], function (module) {
    'use strict';
    return module;
});
//# sourceMappingURL=main.js.map