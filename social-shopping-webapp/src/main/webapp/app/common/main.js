/// <reference path='../_all.ts' />
define('petCommonModule', ['angular', 'uiBootstrap', 'angularTranslate'], function (angular) {
    'use strict';
    return angular.module('petCommon', ['ui.bootstrap', 'pascalprecht.translate']);
});
define('petCommon', ['petCommonModule', './controller/PetController', './directive/table/table', './directive/datepicker/DatePicker', './filter/MasterDataFilter', './filter/ParseFilter', './filter/FormatterFilter', './helper/AttributeDefinition', './helper/BackendPagination', './helper/Scope', './provider/lodashProvider', './service/AuthenticationSharedService', './service/ArticleService', './service/ShopService', './service/MasterDataService', './service/Session', './service/UserService'], function (module) {
    'use strict';
    module.constant('cons', {
        'REST_BASE_URL': 'rest',
        'CM_CODE': 'CM',
        'ATTR_TYPE_TAG': 'TAG',
        'SKU_TYPE_MODEL': 'MODEL',
        'SKU_TYPE_CONFIG': 'CONFIG',
        'TREND_1': 'trend1Code',
        'TREND_2': 'trend2Code',
        'GENDER': 'genderSet',
        'AGE_GROUP': 'ageGroupSet',
        /* URL Suffix */
        accessDeniedSuffix: '/403',
        /* Privilege Names */
        PRIVILEGE_EDIT: 'purchase.pet.edit',
        PRIVILEGE_ADMIN: 'purchase.pet.admin',
        /*Age group codes*/
        AGE_GROUP_BABY: 'AGE_GROUP_BABY',
        AGE_GROUP_KID: 'AGE_GROUP_KID',
        AGE_GROUP_TEEN: 'AGE_GROUP_TEEN',
        AGE_GROUP_ADULT: 'AGE_GROUP_ADULT',
        /*Firebase*/
        FIREBASE_BASE_URL: 'https://popping-heat-2182.firebaseio.com/'
    });
    return module;
});
//# sourceMappingURL=main.js.map