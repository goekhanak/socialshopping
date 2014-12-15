define(['petCommonModule'], function (module) {
    'use strict';

    module.factory('MasterDataService', ['$resource', '$http', '$translate', 'cons', 'AttributeDefinition', '$log', '$filter',

        function ($resource, $http, $translate, cons, AttributeDefinition, $log, $filter) {

            var self = this;
            self.cachedAttributeDefinitions = {};

            function prepareCommodityGroup(commodityGroup) {
                // setting 2nd property 'label' for getting abnTree to work correctly
                commodityGroup.label = commodityGroup.displayText = commodityGroup.code + ' ' + commodityGroup.name;

                angular.forEach(commodityGroup.children, function (child) {
                    prepareCommodityGroup(child);
                });
            }

            function prepareCommodityGroups(result) {
                result.unshift({
                    'code': '',
                    'name': '   ',
                    'children': []
                });

                angular.forEach(result, function (commoddityGroup) {
                    prepareCommodityGroup(commoddityGroup);
                });
            }

            function getCommodityGroupBranch(comGroups, branchComGroupCode) {

                if (!comGroups) {
                    return;
                }

                for (var i = 0; i < comGroups.length; i++) {
                    var comGroup = comGroups[i];

                    if (comGroup.code === branchComGroupCode) {
                        return comGroup;
                    }

                    var result = getCommodityGroupBranch(comGroup.children, branchComGroupCode);

                    if (result) {
                        return result;
                    }
                }
            }

            function getCurrentLang() {
                if ($translate.proposedLanguage()) {
                    return $translate.proposedLanguage();
                } else if ($translate.use()) {
                    return $translate.use();
                } else {
                    return $translate.preferredLanguage();
                }
            }

            function isCategoryManagementAttr(attrDefinition) {
                var isCmAttr = false;
                if (!attrDefinition.accessProfileCodes) {
                    return false;
                }

                angular.forEach(attrDefinition.accessProfileCodes, function (accessProfileCode) {
                    if (cons.CM_CODE === accessProfileCode.code) {
                        isCmAttr = true;
                    }
                });
                return isCmAttr;
            }

            function isRequiredAttr(silhouetteCode, attrDefinition) {

                var required = false;
                angular.forEach(attrDefinition.constraints, function (constraint) {
                    if (constraint.silhouetteCode.code === silhouetteCode) {
                        required = constraint.required;
                        return;
                    }
                });
                return required;
            }

            function getOptions(silhouetteCode, attrDefinitionCode, attributeDefinitions) {
                var options = [];

                if (!attributeDefinitions || !silhouetteCode || !attrDefinitionCode) {
                    return options;
                }

                angular.forEach(attributeDefinitions, function (attrDefinition) {

                    var attrDefOptions;
                    if(attrDefinition.type === cons.ATTR_TYPE_TAG){
                        attrDefOptions = attrDefinition.tags;
                    }else{
                        attrDefOptions = attrDefinition.options;
                    }

                    if (attrDefinition.code.code === attrDefinitionCode && attrDefOptions) {
                        angular.forEach(attrDefOptions, function (option) {
                            for (var i = 0; i < option.silhouetteCodes.length; i++) {
                                if (option.silhouetteCodes[i].code === silhouetteCode) {
                                    options.push(option);
                                }
                            }
                        });
                    }
                });

                return options;
            }

            var service = {

                getSupplierConfigs: function () {
                    var connection = $resource('json/supplierConfigs.json', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true
                        }
                    });
                    this.supplierConfigs = connection.query();
                    return this.supplierConfigs;
                },

                getAllBrands: function () {
                    var connection = $resource('rest/masterdata/brand/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true
                        }
                    });
                    this.brands = connection.query();
                    return this.brands;
                },

                getAllSuppliers: function () {
                    var connection = $resource('rest/masterdata/supplier/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true
                        }
                    });
                    this.suppliers = connection.query();
                    return this.suppliers;
                },

                getAllColors: function () {
                    var connection = $resource('rest/masterdata/color/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true,
                            params: {
                                'locale': getCurrentLang()
                            }
                        }
                    });
                    this.colors = connection.query();
                    return this.colors;
                },

                getAllSeasons: function () {
                    var connection = $resource('rest/masterdata/season/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true,
                            params: {
                                'locale': getCurrentLang()
                            }
                        }
                    });
                    this.seasons = connection.query();
                    return this.seasons;
                },

                getAllSubPools: function () {
                    var connection = $resource('rest/masterdata/sub_pool/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true
                        }
                    });
                    this.subPools = connection.query();
                    return this.subPools;
                },

                getUserSubPools: function () {
                    var connection = $resource('rest/masterdata/sub_pool/user', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true
                        }
                    });
                    return  connection.query();
                },

                getAllSizeCharts: function () {
                    var connection = $resource('rest/masterdata/sizechart/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true,
                            params: {
                                'locale': getCurrentLang()
                            }
                        }
                    });
                    this.sizeCharts = connection.query();
                    return this.sizeCharts;
                },

                getAllMaterials: function () {
                    var connection = $resource('rest/masterdata/material/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true,
                            params: {
                                'locale': getCurrentLang()
                            }
                        }
                    });
                    this.materials = connection.query();
                    return this.materials;
                },

                getAllPatterns: function () {
                    var connection = $resource('rest/masterdata/pattern/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true,
                            params: {
                                'locale': getCurrentLang()
                            }
                        }
                    });
                    this.patterns = connection.query();
                    return this.patterns;
                },

                getAllTrends: function () {
                    this.trends = $resource('rest/masterdata/trend/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true,
                            params: {
                                'locale': getCurrentLang()
                            }
                        }
                    });
                    return this.trends;
                },

                getSecondLevelCommodityGroup: function () {

                    var connection = $resource('rest/masterdata/commodity/secondlevel', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true,
                            params: {
                                'locale': getCurrentLang()
                            }
                        }
                    });
                    this.seconLevelComGroups = connection.query();

                    this.seconLevelComGroups.$promise.then(
                        //success
                        function (result) {
                            prepareCommodityGroups(result);
                        },
                        //error
                        function (error) {
                            console.log(error);
                        }
                    );

                    return this.seconLevelComGroups;
                },

                getAllCommodityGroup: function () {

                    var connection = $resource('rest/masterdata/commodity/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true,
                            params: {
                                'locale': getCurrentLang()
                            }
                        }
                    });
                    this.comGroups = connection.query();

                    this.comGroups.$promise.then(
                        //success
                        function (result) {
                            prepareCommodityGroups(result);
                        },
                        //error
                        function (error) {
                            console.log(error);
                        }
                    );

                    return this.comGroups;
                },

                getAllSilhouettes: function () {
                    var connection = $resource('rest/masterdata/silhouette/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true
                        }
                    });
                    this.silhouettes = connection.query();
                    return this.silhouettes;
                },

                getAllProductGroups: function () {
                    var connection = $resource('rest/masterdata/product_group/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true
                        }
                    });
                    this.productGroups = connection.query();
                    return this.productGroups;
                },

                getAllAttributeDefinitions: function () {

                    var connection = $resource('rest/masterdata/attribute_definition/all', {}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            cache: true
                        }
                    });
                    this.attributeDefinitions = connection.query();
                    return this.attributeDefinitions;
                },

                getKeyStyleOptions: function () {
                    return [
                        {
                            key: null,
                            translateKey: 'masterData.keystyle.all'
                        },
                        {
                            key: true,
                            translateKey: 'masterData.keystyle.true'
                        },
                        {
                            key: false,
                            translateKey: 'masterData.keystyle.false'
                        }
                    ];
                },

                getKeyStyleForKey: function (key) {
                    for (var i = 0; i < this.getKeyStyleOptions().length; i++) {
                        var keyStyle = this.getKeyStyleOptions()[i];

                        if (keyStyle.key === key) {
                            return keyStyle;
                        }
                    }
                },

                getCommodityGroupBranchForCode: function (comGroupCode, cb) {
                    this.comGroups.$promise.then(
                        //success
                        function (comGroups) {
                            var result = getCommodityGroupBranch(comGroups, comGroupCode);

                            if (result) {
                                cb([result]);
                            } else {
                                cb(comGroups);
                            }
                        }
                    );
                },

                isCommodityGroupCodeLeaf: function (comGroupCode) {

                    if (!comGroupCode) {
                        return false;
                    }

                    var comGroup = getCommodityGroupBranch(this.comGroups, comGroupCode);

                    if (!comGroup || !comGroup.children) {
                        return false;
                    }

                    return comGroup.children.length < 1;
                },

                getCommodityGroup: function (comGroupCode) {

                    if (!comGroupCode) {
                        return false;
                    }

                    return getCommodityGroupBranch(this.comGroups, comGroupCode);

                },

                colorCodeExists: function (code) {
                    return this.codeExists(this.colors, code);
                },

                materialCodeExists: function (code) {
                    return this.codeExists(this.materials, code);
                },

                patternCodeExists: function (code) {
                    return this.codeExists(this.patterns, code);
                },

                codeExists: function (dataArray, code) {
                    if (!dataArray || !code) {
                        return false;
                    }

                    var exists;
                    angular.forEach(dataArray, function (data) {
                        if (data.code === code) {
                            exists = true;
                            return;
                        }
                    });

                    return exists;
                },

                getAllDomains: function () {
                    return [
                        {
                            'code': 'ARTICLE_DOMAIN_DEFAULT',
                            'name': 'Standard'
                        },
                        {
                            'code': 'ARTICLE_DOMAIN_SPORTS',
                            'name': 'Sports'
                        },
                        {
                            'code': 'ARTICLE_DOMAIN_PREMIUM',
                            'name': 'Premium'
                        },
                        {
                            'code': 'ARTICLE_DOMAIN_OVERSIZE',
                            'name': 'Oversize'
                        },
                        {
                            'code': 'ARTICLE_DOMAIN_GREEN',
                            'name': 'Green'
                        },
                        {
                            'code': 'ARTICLE_DOMAIN_MATERNITY',
                            'name': 'Maternity'
                        },
                        {
                            'code': 'ARTICLE_DOMAIN_LIFESTYLE',
                            'name': 'Lifestyle'
                        }
                    ];
                },

                getBrand: function (code) {
                    return this.getDataForCode(this.brands, code);
                },

                getSupplier: function (code) {
                    return this.getDataForCode(this.suppliers, code);
                },

                displayTextForBrandCode: function (brandCode) {
                    return this.displayTextForCode(this.brands, brandCode);
                },

                displayTextForSupplierCode: function (supplierCode) {
                    return this.displayTextForCode(this.suppliers, supplierCode);
                },

                displayTextForColorCode: function (colorCode) {
                    return this.displayTextForCode(this.colors, colorCode);
                },

                displayTextForPatternCode: function (patternCode) {
                    return this.displayNameForCode(this.patterns, patternCode);
                },

                displayTextForMaterialCode: function (materialCode) {
                    return this.displayTextForCode(this.materials, materialCode);
                },

                displayTextForDomainCode: function (domainCode) {
                    return this.displayNameForCode(this.getAllDomains(), domainCode);
                },

                displayTextForSeasonCode: function (seasonCode) {
                    return this.displayTextForCode(this.seasons, seasonCode);
                },

                displayTextForCommodityGroupCode: function (code) {

                    var commodityGroups = this.comGroups ? this.comGroups : this.seconLevelComGroups;

                    var commodityGroup = this.findCommodityGroupByCode(commodityGroups, code);

                    if (commodityGroup !== null) {
                        return commodityGroup.displayText;
                    }

                    // not found
                    return code;
                },

                displayTextForSubPoolId: function (subPoolId) {
                    if (!this.subPools || !subPoolId) {
                        return subPoolId;
                    }

                    var displayText;
                    angular.forEach(this.subPools, function (subPool) {
                        if (subPool.id === subPoolId) {
                            displayText = subPool.name;
                            return;
                        }
                    });

                    return displayText ? displayText : subPoolId;
                },

                displayTextForSizeChartCode: function (sizeChartCode) {
                    if (!this.sizeCharts || !sizeChartCode) {
                        return sizeChartCode;
                    }

                    var displayText;
                    angular.forEach(this.sizeCharts, function (sizeChart) {
                        if (sizeChart.code === sizeChartCode) {
                            displayText = sizeChart.name + ' (' + sizeChart.code + ')';
                            return;
                        }
                    });

                    return displayText ? displayText : sizeChartCode;
                },

                findCommodityGroupByCode: function (dataArray, code) {

                    if (!dataArray || !code) {
                        return null;
                    }

                    for (var i = 0; i < dataArray.length; i++) {
                        var commodityGroup = dataArray[i];

                        if (commodityGroup.code === code) {
                            return commodityGroup;
                        }

                        var childCommodityGroup = this.findCommodityGroupByCode(commodityGroup.children,
                            code);

                        if (childCommodityGroup !== null) {
                            return childCommodityGroup;
                        }
                    }

                    return null;
                },

                getDataForCode: function (dataArray, code) {

                    if (!dataArray || !code) {
                        return code;
                    }

                    var masterData;
                    angular.forEach(dataArray, function (entry) {
                        if (entry.code === code) {
                            masterData = entry;
                            return;
                        }
                    });

                    return masterData ? masterData : code;
                },

                displayTextForCode: function (dataArray, code) {

                    if (!dataArray || !code) {
                        return code;
                    }

                    var displayText;
                    angular.forEach(dataArray, function (data) {
                        if (data.code === code) {
                            displayText = data.name + ' (' + data.code + ')';
                            return;
                        }
                    });

                    return displayText ? displayText : code;
                },

                displayNameForCode: function (dataArray, code) {

                    if (!dataArray || !code) {
                        return code;
                    }

                    var displayText;
                    angular.forEach(dataArray, function (data) {
                        if (data.code === code) {
                            displayText = data.name;
                            return;
                        }
                    });

                    return displayText ? displayText : code;
                },

                getProductGroupCodeForSilhouetteCode: function (silhouetteCode) {

                    var productGroupCode;

                    if (!this.silhouettes || !silhouetteCode) {
                        return productGroupCode;
                    }

                    angular.forEach(this.silhouettes, function (data) {
                        if (data.code.code === silhouetteCode) {
                            productGroupCode = data.productGroup.code.code;
                            return;
                        }
                    });

                    return productGroupCode;
                },

                getSilhouetteCodesForProductGroupCode: function (productGroupCode) {

                    var silhouetteCodeList = [];

                    if (!this.silhouettes || !productGroupCode) {
                        return silhouetteCodeList;
                    }

                    angular.forEach(this.silhouettes, function (data) {
                        if (data.productGroup.code.code === productGroupCode) {
                            silhouetteCodeList.push(data.code.code);
                            return;
                        }
                    });

                    return silhouetteCodeList;
                },

                displayTextForProductGroupCode: function (code) {
                    if (!this.productGroups || !code) {
                        return code;
                    }

                    var displayText;
                    angular.forEach(this.productGroups, function (data) {
                        if (data.code.code === code) {
                            displayText = data.names[getCurrentLang()];
                            return;
                        }
                    });

                    return displayText ? displayText : code;

                },

                displayTextForSilhouetteCode: function (code) {
                    return this.displayTextForCodeMultipleLocale(this.silhouettes, code);
                },

                displayTextForAttrDefinitionCode: function (code) {
                    return this.displayTextForCodeMultipleLocale(this.attributeDefinitions, code);
                },

                displayTextForCodeMultipleLocale: function (dataArray, code) {

                    if (!dataArray || !code) {
                        return code;
                    }

                    var displayText;
                    angular.forEach(dataArray, function (data) {
                        if (data.code.code === code) {
                            displayText = data.displayNames[getCurrentLang()];
                            return;
                        }
                    });

                    return displayText ? displayText : code;
                },

                displayTextForAttrValue: function (attrValueCode) {
                    var displayText = attrValueCode;

                    if (!this.silhouettes || !attrValueCode) {
                        return displayText;
                    }

                    angular.forEach(this.silhouettes, function (silhouette) {
                        if (silhouette.options) {
                            for (var i = 0; i < silhouette.options.length; i++) {
                                var option = silhouette.options[i];
                                if (option.code.code === attrValueCode) {
                                    displayText = option.displayNames[getCurrentLang()];
                                    return;
                                }
                            }
                        }
                    });

                    return displayText;
                },

                getAttrDefinitionCodesForSilhouetteCode: function (silhouetteCode, skuType) {
                    var silhouetteAttrDefinitions = [];

                    var attributeDefinitions = this.attributeDefinitions;
                    if (!attributeDefinitions || !silhouetteCode) {
                        return silhouetteAttrDefinitions;
                    }

                    function put(attrDefinition, attrDefinitionCode) {
                        if (isCategoryManagementAttr(attrDefinition)) {
                            self.cachedAttributeDefinitions[attrDefinitionCode] = {
                                id: attrDefinitionCode,
                                name: attrDefinition.displayNames[getCurrentLang()],
                                options: getOptions(silhouetteCode, attrDefinitionCode, attributeDefinitions),
                                type: attrDefinition.type,
                                multiselect: attrDefinition.multiselect,
                                required: isRequiredAttr(silhouetteCode, attrDefinition),
                                values: []
                            };

                            var cachedAttributeDefinition = self.cachedAttributeDefinitions[attrDefinitionCode];
                            silhouetteAttrDefinitions.push(cachedAttributeDefinition);
                        }
                    }

                    angular.forEach(attributeDefinitions, function (attrDefinition) {

                        if (attrDefinition.skuType !== skuType) {
                            return;
                        }

                        var attrDefinitionCode = attrDefinition.code.code;
                        // general attributes
                        if (!attrDefinition.constraints) {
                            put(attrDefinition, attrDefinitionCode);
                        } // silhouette depedent attrs
                        else {
                            angular.forEach(attrDefinition.constraints, function (constraint) {
                                if (constraint.silhouetteCode.code === silhouetteCode) {
                                    if (!silhouetteAttrDefinitions[attrDefinitionCode]) {
                                        put(attrDefinition, attrDefinitionCode);
                                    }
                                }
                            });
                        }
                    });

                    return silhouetteAttrDefinitions;
                },

                fillConfigGenericAttrs: function () {
                    var trendOptions = [];
                    this.getAllTrends().query({ params: {
                        'locale': getCurrentLang()
                    }}, function (trends) {
                        self.trends = trends;

                        angular.forEach(trends, function (trend) {
                            this.push({
                                'code': {
                                    'code': trend.code
                                },
                                'displayNames': {
                                    'en': trend.name,
                                    'de': trend.name
                                }
                            });
                        }, trendOptions);
                    });
                    if (!self.cachedAttributeDefinitions[cons.TREND_1]) {
                        var trend1 = {
                            id: cons.TREND_1,
                            options: trendOptions,
                            generic: true,
                            type: 'OPTION',
                            multiselect: false,
                            required: false,
                            values: []
                        };
                        $translate('masterData.trend.trend1_label').then(function (translation) {
                            trend1.name = translation;
                        });
                        self.cachedAttributeDefinitions[cons.TREND_1] = trend1;
                    }

                    if (!self.cachedAttributeDefinitions[cons.TREND_2]) {
                        var trend2 = {
                            id: cons.TREND_2,
                            options: trendOptions,
                            generic: true,
                            type: 'OPTION',
                            multiselect: false,
                            required: false,
                            values: []
                        };
                        $translate('masterData.trend.trend2_label').then(function (translation) {
                            trend2.name = translation;
                        });
                        self.cachedAttributeDefinitions[cons.TREND_2] = trend2;
                    }
                },

                fillModelGenericAttrs: function () {
                    if (!self.cachedAttributeDefinitions[cons.GENDER]) {
                        var gender = {
                            id: cons.GENDER,
                            options: [
                                {
                                    'code': {
                                        'code': 'GENDER_MALE'
                                    },
                                    'displayNames': {
                                        'en': 'Male',
                                        'de': 'Männlich'
                                    }
                                },
                                {
                                    'code': {
                                        'code': 'GENDER_FEMALE'
                                    },
                                    'displayNames': {
                                        'en': 'Female',
                                        'de': 'Weiblich'
                                    }
                                }
                            ],
                            generic: true,
                            required: true,
                            type: 'OPTION',
                            multiselect: true,
                            values: []
                        };
                        $translate('masterData.gender.label').then(function (translation) {
                            gender.name = translation;
                        });
                        self.cachedAttributeDefinitions[cons.GENDER] = gender;
                    }

                    if (!self.cachedAttributeDefinitions[cons.AGE_GROUP]) {
                        var ageGroup = {
                            id: cons.AGE_GROUP,
                            options: [
                                {
                                    'code': {
                                        'code': cons.AGE_GROUP_BABY
                                    },
                                    'displayNames': {
                                        'en': 'Baby',
                                        'de': 'Baby'
                                    }
                                },
                                {
                                    'code': {
                                        'code': cons.AGE_GROUP_KID
                                    },
                                    'displayNames': {
                                        'en': 'Kid',
                                        'de': 'Kind'
                                    }
                                },
                                {
                                    'code': {
                                        'code': cons.AGE_GROUP_TEEN
                                    },
                                    'displayNames': {
                                        'en': 'Teenager',
                                        'de': 'Teenager'
                                    }
                                },
                                {
                                    'code': {
                                        'code': cons.AGE_GROUP_ADULT
                                    },
                                    'displayNames': {
                                        'en': 'Adult',
                                        'de': 'Erwachsene'
                                    }
                                }
                            ],
                            generic: true,
                            required: true,
                            type: 'OPTION',
                            multiselect: true,
                            values: []
                        };
                        $translate('masterData.ageGroup.label').then(function (translation) {
                            ageGroup.name = translation;
                        });
                        self.cachedAttributeDefinitions[cons.AGE_GROUP] = ageGroup;
                    }
                },

                getAttribute: function getAttribute(key) {
                    return angular.copy(self.cachedAttributeDefinitions[key]);
                },


                fillAttributeValues: function (attributeDefinitions, attributeValues) {

                    if(!angular.isArray(attributeDefinitions) || !angular.isArray(attributeValues)){
                        return;
                    }

                    angular.forEach(attributeValues, function (attributeValue){
                        var code = attributeValue.attributeDefinitionCode;

                        var attrDefinition;
                        angular.forEach(attributeDefinitions, function(cachedAttrDefinition) {
                            if(cachedAttrDefinition.id === code){
                                attrDefinition = cachedAttrDefinition;
                            }
                        });

                        if (attrDefinition) {
                            attrDefinition.values = [];
                            angular.forEach(attrDefinition.options, function (option) {
                                if (attributeValue.values.indexOf(option.code.code) !== -1) {
                                    attrDefinition.values.push(option);
                                }
                            });
                        }
                    });
                }
            };

            service.fillConfigGenericAttrs();
            service.fillModelGenericAttrs();

            return service;
        }
    ]);
});
