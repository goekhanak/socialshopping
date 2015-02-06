/// <reference path='../_all.ts' />
/// <amd-dependency path="angular"/>
define('socialShoppingModule', ['angular', 'socialShoppingModule'], function (angular) {
    'use strict';
    return angular.module('socialShopping', ['petCommon']);
});
define('socialShopping', ['socialShoppingModule', './service/ShopService', './controller/SocialController'], function (module) {
    'use strict';
    return module;
});
//# sourceMappingURL=main.js.map