define(['petCommonModule'], function (module) {
    'use strict';

    module.filter('brandDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForBrandCode(code);
            };
        }
    ]);

    module.filter('supplierDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForSupplierCode(code);
            };
        }
    ]);

    module.filter('commodityGroupDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForCommodityGroupCode(code);
            };
        }
    ]);

    module.filter('subPoolDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (subPoolId) {
                return MasterDataService.displayTextForSubPoolId(subPoolId);
            };
        }
    ]);

    module.filter('seasonCodeDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForSeasonCode(code);
            };
        }
    ]);

    module.filter('sizeChartDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForSizeChartCode(code);
            };
        }
    ]);

    module.filter('colorDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForColorCode(code);
            };
        }
    ]);

    module.filter('materialDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForMaterialCode(code);
            };
        }
    ]);

    module.filter('patternDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForPatternCode(code);
            };
        }
    ]);

    module.filter('domainDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (codes) {
                var labels = [];
                angular.forEach(codes, function (code) {
                    var label = MasterDataService.displayTextForDomainCode(code);
                    labels.push(label);
                });

                return labels.join(', ');
            };
        }
    ]);

    module.filter('zalandoPrice', ['$filter', '$locale',
        function (filter, locale) {
            var currencyFilter = filter('currency');

            var currencySymbols = {
                EUR: '\u20AC',
                USD: '$',
                GBP: '\u20A4',
                RUB: 'руб',
                TRY: 'TL',
                PLN: 'zł'
            };

            return function (amount, currencyCode) {

                var currencySymbol;
                if (currencySymbols[currencyCode]) {
                    currencySymbol = currencySymbols[currencyCode];
                } else {
                    currencySymbol = currencyCode;
                }

                var value = currencyFilter(amount / 100, currencySymbol + ' ');

                return value;
            };
        }
    ]);

    module.filter('keyStyleDisplay', ['MasterDataService', '$translate', '$filter',
        function (MasterDataService, $translate, $filter) {
            return function (keyStyleKey) {
                if (typeof keyStyleKey === 'undefined') {
                    return;
                }

                var keyStyle = MasterDataService.getKeyStyleForKey(keyStyleKey);

                return $filter('translate')(keyStyle.translateKey);
            };
        }
    ]);

    module.filter('labelTranslator', ['$translate',
        function ($translate) {
            return function (input) {
                if (input.displayNames) {
                    return input.displayNames[$translate.use()];
                } else {
                    return input;
                }
            };
        }
    ]);

    module.filter('orderResponseStatusDisplay', ['$translate', '$filter',
        function ($translate, $filter) {
            return function (statusName) {
                // return $translate('order.status.' + statusName);
                return $filter('translate')('order.status.' + statusName);

            };
        }
    ]);

    module.filter('articleStatusDisplay', ['$translate', '$filter',
        function ($translate, $filter) {
            return function (statusName) {
                //return $translate('order.detail.status.' + statusName);
                return $filter('translate')('order.detail.status.' + statusName);
            };
        }
    ]);

    module.filter('productGroupForSilhouette', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.getProductGroupCodeForSilhouetteCode(code);
            };
        }
    ]);

    module.filter('productGroupDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForProductGroupCode(code);
            };
        }
    ]);

    module.filter('silhouetteCodesForProductGroupCode', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.getSilhouetteCodesForProductGroupCode(code);
            };
        }
    ]);

    module.filter('silhouetteDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForSilhouetteCode(code);
            };
        }
    ]);

    module.filter('attrDefinitionDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForAttrDefinitionCode(code);
            };
        }
    ]);

    module.filter('attrValueDisplay', ['MasterDataService',
        function (MasterDataService) {
            return function (code) {
                return MasterDataService.displayTextForAttrValue(code);
            };
        }
    ]);

    module.filter('configSkuSuffix', [
        function () {
            return function (configSKu) {
                if(!angular.isString(configSKu)){
                    return configSKu;
                }

                return configSKu.slice(configSKu.indexOf('-')+1);
            };
        }
    ]);

    module.filter('configTitleDisplay', ['$filter',
        function ($filter) {
            return function (config) {
                if(!config || !config.configSku || !config.mainColorCode ){
                    return '';
                }

                return  $filter('configSkuSuffix')(config.configSku) + ' (' + $filter('colorDisplay')(config.mainColorCode) + ')';
            };
        }
    ]);

    module.filter('slice', function() {
        return function(arr, start, end) {
            if(!arr){
                return [];
            }
            return arr.slice(start, end);
        };
    });
});
