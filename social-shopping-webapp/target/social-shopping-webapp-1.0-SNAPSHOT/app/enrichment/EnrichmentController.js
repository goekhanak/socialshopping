define(['petEnrichmentModule'], function (module) {
    'use strict';

    module.controller('EnrichmentController', ['$scope', '$injector',
        function ($scope, $injector) {

            /*Dependencies*/
            var $log = $injector.get('$log');
            var $modal = $injector.get('$modal');
            var MasterDataService = $injector.get('MasterDataService');
            var ArticleService = $injector.get('ArticleService');
            var BackendPagination = $injector.get('BackendPagination');
            var cons = $injector.get('cons');
            var $filter = $injector.get('$filter');
            var $q = $injector.get('$q');

            var self = this;

            self.articles = [];
            self.fullyEnriched = false;
            self.dirty = false;
            self.currentArticle = {};
            self.editModelForm = {
                'template': 'app/enrichment/editModelForm.html',
                'heading': 'article.model',
                'disabled': false,
                'display': true
            };
            self.editConfigForm = {
                'template': 'app/enrichment/editConfigForm.html',
                'disabled': false,
                'display': true
            };
            self.editAttrs = {
                'template': 'app/enrichment/editAttributes.html',
                'disabled': false,
                'display': true
            };
            self.articleTableConf = [
                {
                    'title': 'article.sku',
                    'type': 'string',
                    'property': 'modelSku'
                },
                {
                    'title': 'article.supplierArticleNumber',
                    'type': 'string',
                    'property': 'supplierArticleNumber'
                },
                {
                    'title': 'masterData.brand',
                    'type': 'string',
                    'property': 'brandCode',
                    'formatterFilter': 'brandDisplayFilter'
                },
                {
                    'title': 'masterData.commodityGroup',
                    'type': 'string',
                    'property': 'commodityGroupCode',
                    'formatterFilter': 'commodityGroupDisplayFilter'
                },
                {
                    'title': 'masterData.supplier',
                    'type': 'string',
                    'property': 'supplierCode',
                    'formatterFilter': 'supplierDisplayFilter'
                },
                {
                    'title': 'article.deliveryDateMin',
                    'type': 'string',
                    'property': 'earliestDeliveryDate'
                },
                {
                    'title': 'masterData.keystyle.label',
                    'type': 'string',
                    'property': 'keyStyle'
                }
            ];
            self.showArticleForm = false;
            self.loadingArticles = false;
            self.masterData = {};
            self.masterData.secondLevelCommodityGroups = [];
            self.filterCriteria = {};
            self.pageNumber = 0;
            self.sort = {
                'field': 'earliestDeliveryDate',
                'reverse': false
            };
            self.MAX_CONFIG_TAB = 9;

            /*Functions*/

            /*Search article related*/
            function searchArticles() {
                // new search is triggered
                $log.debug('searchArticles');

                self.pageNumber = 0;
                $scope.$load(
                    ArticleService.search(BackendPagination.buildRequest({
                        'page': self.pageNumber++,
                        'size': 35,
                        'sortBy': self.sort.field,
                        'sortDesc': self.sort.reverse,
                        'filterBy': self.filterCriteria
                    })),

                    function (articles) {
                        self.articles = articles;
                    }
                );
            }

            function loadMore(page, sortAttr, sortDesc) {

                $log.debug('loadMore');

                $scope.$load(
                    ArticleService.search(BackendPagination.buildRequest({
                        'page': page,
                        'size': 35,
                        'sortBy': sortAttr,
                        'sortDesc': sortDesc,
                        'filterBy': self.filterCriteria
                    })),
                    function (more) {
                        self.articles.push.apply(self.articles, more);
                    },
                    'enrichment.loadingArticles',
                    'enrichment.errorArticles');
            }

            function resetFilterCriteria() {
                self.filterCriteria = {};
            }

            function selectFilterCriterion(searchKey, value) {
                self.filterCriteria[searchKey] = value;
            }

            function onSearchFilterKeyPress($event) {
                // when submit is pressed
                if (13 === $event.keyCode) {
                    $event.preventDefault();
                    self.searchArticles();
                }
            }

            /**
             * Handler which is called when commodity group is changed
             **/
            function comGroupHandler(branch) {
                self.filterCriteria.commodityGroupCode = branch.code;
            }

            function formatBrandCode(brandCode) {
                return MasterDataService.displayTextForBrandCode(brandCode);
            }

            function formatSupplierCode(supplierCode) {
                return MasterDataService.displayTextForSupplierCode(supplierCode);
            }

            function formatSubPoolId(subpoolId) {
                return MasterDataService.displayTextForSubPoolId(subpoolId);
            }

            function saveArticle() {
                self.saveConfigAttributes();
                self.saveModelAttributes();
                self.currentArticle.$save(function (data, headers) {
                    $log.log('Save successful', data);
                    self.currentArticleLoaded();
                }, function (error) {
                    $log.error('Save article model failed ! Response:', error);
                    handleArticleOperationError(error, 'save');
                });
            }

            function submitArticle() {
                self.saveConfigAttributes();
                self.saveModelAttributes();
                self.currentArticle.$save(function (data, headers) {
                    ArticleService.submit(self.currentArticle.modelSku).$promise.then(
                        //success
                        function (result) {
                            $log.log('Submit article model successful with sku: ', self.currentArticle.modelSku);
                            self.dirty = false;
                            self.unselectArticle();
                            self.searchArticles();
                        },
                        //error
                        function (error) {
                            $log.error('Submit article model failed with sku: :', self.currentArticle.modelSku);
                            handleArticleOperationError(error, 'submit');

                        });
                }, function (error) {
                    $log.error('Save article model failed ! Response:', error);
                    handleArticleOperationError(error, 'save');
                });
            }

            function selectArticle(idx, article) {
                // copy current to reset later
                self.showArticleForm = 'edit';

                self.resetCurrentAttributes();

                $log.debug('SelectedArticle:', article);

                ArticleService.get(article.modelSku).$promise.then(
                    //success
                    function (article) {
                        self.currentArticle = article;
                        self.currentArticleLoaded();
                    },
                    //error
                    function (error) {
                        $log.error('Get article model failed with sku: :', article.modelSku);
                        handleArticleOperationError(error, 'retrieve');
                    }
                );
            }

            function currentArticleLoaded() {
                $log.debug('CurrentArticle:', self.currentArticle);
                self.fillModelAttrsWithValues();
                self.fillConfigAttrsWithValues();
                self.modelTabSelected();
                self.updateEnrichmentStatus();
                self.dirty = false;
                self.extraTabSelectedConfig = {};
            }

            function modelTabSelected() {
                self.currentAttrDefintions = self.modelAttributes;
                self.currentDisplayedArticle = self.currentArticle;
                self.selectedAttribute = null;
            }

            function configTabSelected(config) {
                self.currentAttrDefintions = self.configAttributes[config.configSku];
                self.currentDisplayedArticle = config;
                self.selectedAttribute = null;
            }

            /*
             * Checks if currently there are unsaved changes. If so asks user for confirmation.
             *
             * @return a promise which will resolve if there are no changes or user accepted to loose them.
             * */
            function checkChangesSaved() {
                var deferred = $q.defer();

                if (self.dirty === true) {
                    var modalInstance = $modal.open({
                        templateUrl: 'app/enrichment/simpleModalPopup.html',
                        controller: ModalInstanceCtrl,
                        size: 'sm'
                    });

                    modalInstance.bodyTranslationKey = 'article.warning.notSavedChanges';

                    modalInstance.result.then(function () {
                        self.dirty = false;
                        deferred.resolve();
                    }, function () {
                        deferred.reject();
                    });
                } else {
                    deferred.resolve();
                }

                return deferred.promise;
            }

            function unselectArticle() {
                self.checkChangesSaved().then(function () {
                    resetCurrentArticle();
                    self.showArticleForm = false;
                });
            }

            function selectProductGroup(productGroupCode) {

                // if new value same as old ignore
                if (self.productGroupCode === productGroupCode) {
                    return;
                }

                if (self.hasCurrentArticleNonGenericAttrValues()) {
                    $log.debug('Article has already attr values');

                    var modalInstance = $modal.open({
                        templateUrl: 'app/enrichment/simpleModalPopup.html',
                        controller: ModalInstanceCtrl,
                        size: 'sm'
                    });

                    modalInstance.bodyTranslationKey = 'article.warning.attributesLost';

                    modalInstance.result.then(function () {
                        self.applyProductGroupSelection(productGroupCode);
                    });
                } else {
                    self.applyProductGroupSelection(productGroupCode);
                }
            }

            function applyProductGroupSelection(productGroupCode) {
                if (self.currentArticle.silhouetteCode) {
                    self.currentArticle.silhouetteCode = null;
                }

                self.resetCurrentAttributes();
                self.productGroupCode = productGroupCode;

                self.dirty = true;
                self.fillModelAttrsWithValues();
                self.fillConfigAttrsWithValues();
                self.updateEnrichmentStatus();
            }

            function selectSilhouette(silhouetteCode) {
                // if new value same as old ignore
                if (self.currentArticle.silhouetteCode === silhouetteCode) {
                    return;
                }

                if (self.hasCurrentArticleNonGenericAttrValues()) {
                    $log.debug('Article has already attr values');
                    var modalInstance = $modal.open({
                        templateUrl: 'app/enrichment/simpleModalPopup.html',
                        controller: ModalInstanceCtrl,
                        size: 'sm'
                    });

                    modalInstance.bodyTranslationKey = 'article.warning.attributesLost';

                    modalInstance.result.then(function () {
                        self.applySilhouetteSelection(silhouetteCode);
                    });
                } else {
                    self.applySilhouetteSelection(silhouetteCode);
                }
            }

            function applySilhouetteSelection(silhouetteCode) {
                self.resetCurrentAttributes();
                self.currentArticle.silhouetteCode = silhouetteCode;
                self.dirty = true;
                self.fillModelAttrsWithValues();
                self.fillConfigAttrsWithValues();
                self.modelTabSelected();
                self.updateEnrichmentStatus();
            }

            /*
             * Checks if the current article attributes has any attribute values
             * */
            function hasCurrentArticleNonGenericAttrValues() {
                if (!self.currentArticle) {
                    return false;
                }

                if (self.hasNonGenericAttributesValues(self.modelAttributes)) {
                    return true;
                }

                for (var i = 0; i < self.currentArticle.configs.length; i++) {
                    var config = self.currentArticle.configs[i];

                    if (self.hasNonGenericAttributesValues(self.configAttributes[config.configSku])) {
                        return true;
                    }
                }

                return false;
            }

            function hasNonGenericAttributesValues(attrs) {

                for (var i = 0; i < attrs.length; i++) {
                    var attr = attrs[i];
                    if (!attr.generic && attr.values.length > 0) {
                        return true;
                    }
                }

                return false;
            }

            function resetCurrentAttributes() {
                self.modelAttributes = [];
                self.configAttributes = {};
                self.currentAttrDefintions = [];
                self.selectedAttribute = null;
                self.productGroupCode = null;
            }

            function isOptionSelected(option) {
                if (!self.selectedAttribute.options) {
                    return false;
                }

                for (var i = 0; i < self.selectedAttribute.values.length; i++) {
                    var value = self.selectedAttribute.values[i];

                    /*option is same as value*/
                    if (value === option) {
                        return true;
                    }
                }

                return false;
            }

            function toggleAllOptions() {
                angular.forEach(self.selectedAttribute.options, function (option) {
                    /* add the option to values*/
                    if (self.selectedAttribute.allOptionsChecked === true && self.selectedAttribute.values.indexOf(option) < 0) {
                        self.selectOption(option);
                    }
                    /* remove option from values*/
                    else if (self.selectedAttribute.allOptionsChecked === false && self.selectedAttribute.values.indexOf(option) > -1) {
                        self.selectOption(option);
                    }
                });
            }

            function selectOption(option) {

                // check if option is selectable
                if (!self.optionSelectable(option)) {
                    return;
                }

                if (self.selectedAttribute.multiselect === false) {
                    /* option is already checked */
                    if (self.selectedAttribute.values.length > 0 && self.selectedAttribute.values[0] === option) {
                        self.selectedAttribute.values = [];
                    } else { /* option has not been checked */

                        self.selectedAttribute.values = [];
                        self.selectedAttribute.values.push(option);
                    }
                } else {
                    var index = self.selectedAttribute.values.indexOf(option);
                    if (index > -1) {
                        self.selectedAttribute.values.splice(index, 1);
                    } else {
                        self.selectedAttribute.values.push(option);
                    }
                }

                self.dirty = true;
                self.updateEnrichmentStatus();
            }

            function optionSelectable(option) {
                // No restrictions for other attributes except AGE_GROUP
                if (self.selectedAttribute.id !== cons.AGE_GROUP) {
                    return true;
                }

                // no previous attribute values
                if (self.selectedAttribute.values.length === 0) {
                    return true;
                }

                // already in the selected values therefore it is allowed to deselect
                if (self.selectedAttribute.values.indexOf(option) > -1) {
                    return true;
                }

                var restrictedAgeGroups;
                //  there are 2 main restriction groups AGE_GROUP_ADULT and the others.
                if (extractAttrValue(option) === cons.AGE_GROUP_ADULT) {
                    restrictedAgeGroups = [cons.AGE_GROUP_ADULT];
                } else {
                    restrictedAgeGroups = [cons.AGE_GROUP_BABY, cons.AGE_GROUP_KID, cons.AGE_GROUP_TEEN];
                }

                for (var i = 0; i < self.selectedAttribute.values.length; i++) {
                    var valueOption = self.selectedAttribute.values[i];
                    if (restrictedAgeGroups.indexOf(extractAttrValue(valueOption)) < 0) {
                        return false;
                    }
                }

                return true;
            }

            function updateEnrichmentStatus() {
                var currentArticleEnriched = true;
                for (var i = 0; i < self.currentAttrDefintions.length; i++) {
                    var attr = self.currentAttrDefintions[i];
                    if (attr.required === true && attr.values.length === 0) {
                        currentArticleEnriched = false;
                    }
                }

                // validate if model is current displayed article and silhouetteCode is set
                if (self.currentDisplayedArticle.modelSku && !self.currentDisplayedArticle.silhouetteCode) {
                    currentArticleEnriched = false;
                }

                self.currentDisplayedArticle.enriched = currentArticleEnriched;

                self.fullyEnriched = (self.currentArticle.inProduction === true || self.currentArticle.enriched === true) && self.currentArticle.configs && self.currentArticle.configs.every(function (config) {
                    return (config.inProduction === true || config.enriched === true);
                });
            }


            function getGenericAttrWithValues(article, attrName) {
                var attr = MasterDataService.getAttribute(attrName);

                if (article[attrName] !== null) {
                    for (var i = 0; i < attr.options.length; i++) {
                        var option = attr.options[i];

                        // single select
                        if (attr.multiselect === false && article[attrName] === option.code.code) {
                            attr.values.push(option);
                            break;
                        } // multi select
                        else if (attr.multiselect === true && article[attrName].indexOf(option.code.code) > -1) {
                            attr.values.push(option);
                        }
                    }
                }

                return attr;
            }

            function fillConfigAttrsWithValues() {
                self.configAttrDefinitions = MasterDataService.getAttrDefinitionCodesForSilhouetteCode(self.currentArticle.silhouetteCode, cons.SKU_TYPE_CONFIG);
                self.configAttributes = {};

                angular.forEach(self.currentArticle.configs, function (config) {
                    self.configAttributes[config.configSku] = angular.copy(self.configAttrDefinitions);
                    MasterDataService.fillAttributeValues(self.configAttributes[config.configSku], config.attributeValues);

                    self.configAttributes[config.configSku].push(getGenericAttrWithValues(config, cons.TREND_1));
                    self.configAttributes[config.configSku].push(getGenericAttrWithValues(config, cons.TREND_2));
                });
            }

            function fillModelAttrsWithValues() {

                // set product group from Silhouette
                if (self.currentArticle.silhouetteCode) {
                    self.productGroupCode = MasterDataService.getProductGroupCodeForSilhouetteCode(self.currentArticle.silhouetteCode);
                }
                self.modelAttributes = MasterDataService.getAttrDefinitionCodesForSilhouetteCode(self.currentArticle.silhouetteCode, cons.SKU_TYPE_MODEL);

                MasterDataService.fillAttributeValues(self.modelAttributes, self.currentArticle.attributeValues);

                self.modelAttributes.push(getGenericAttrWithValues(self.currentArticle, cons.AGE_GROUP));
                self.modelAttributes.push(getGenericAttrWithValues(self.currentArticle, cons.GENDER));
            }

            function extractAttrValue(value) {
                /* when no value is set*/
                if (!value) {
                    return null;
                }

                /* attribute value from cache */
                if (value.code) {
                    return value.code.code;
                } else { /*attribute value not in the cache */
                    return value;
                }
            }

            /**
             * Saves the generic attribute to the article.
             *
             * @param article can be model or config
             * @param attrs attributes
             * @param attrName the code of the attribute
             * */
            function saveGenericAttribute(article, attrs, attrName) {
                var genericAttrFound = false;
                angular.forEach(attrs, function (attr) {
                    if (attr.generic === true && attr.id === attrName) {
                        genericAttrFound = true;
                        if (attr.multiselect === false) {
                            article[attrName] = self.extractAttrValue(attr.values[0]);
                        } else {
                            article[attrName] = attr.values.map(function (value) {
                                return self.extractAttrValue(value);
                            });
                        }
                    }
                });

                if (genericAttrFound === false) {
                    $log.error('Generic attribute can not be found in saveGenericAttribute:', attrName);
                }
            }

            function saveConfigAttributes() {

                angular.forEach(self.currentArticle.configs, function (config) {

                    if (self.configAttributes[config.configSku]) {
                        /*remove all attributes*/
                        config.attributeValues = [];

                        angular.forEach(self.configAttributes[config.configSku], function (configAttribute) {
                            if (configAttribute.values.length > 0 && configAttribute.generic !== true) {
                                config.attributeValues.push({
                                    'attributeDefinitionCode': configAttribute.id,
                                    'values': configAttribute.values.map(function (value) {
                                        return self.extractAttrValue(value);
                                    }),
                                    'type': configAttribute.type
                                });
                            }
                        });

                        saveGenericAttribute(config, self.configAttributes[config.configSku], cons.TREND_1);
                        saveGenericAttribute(config, self.configAttributes[config.configSku], cons.TREND_2);
                    }
                });
            }


            function saveModelAttributes() {
                self.currentArticle.attributeValues = [];

                var genderFound = false;
                var ageGroupFound = false;
                angular.forEach(self.modelAttributes, function (modelAttribute) {
                    if (modelAttribute.values.length > 0 && modelAttribute.generic !== true) {
                        self.currentArticle.attributeValues.push({
                            'attributeDefinitionCode': modelAttribute.id,
                            'values': modelAttribute.values.map(function (value) {
                                return self.extractAttrValue(value);
                            }),
                            'type': modelAttribute.type
                        });
                    }
                });

                saveGenericAttribute(self.currentArticle, self.modelAttributes, cons.AGE_GROUP);
                saveGenericAttribute(self.currentArticle, self.modelAttributes, cons.GENDER);
            }

            function loadMasterData() {

                $scope.$load(
                    MasterDataService.getAllBrands(),
                    function (result) {
                        self.masterData.brands = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllSuppliers(),
                    function (result) {
                        self.masterData.suppliers = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllCommodityGroup(),
                    function (result) {
                        self.masterData.commodityGroupTree = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getSecondLevelCommodityGroup(),
                    function (result) {
                        self.masterData.secondLevelCommodityGroups = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllSubPools(),
                    function (result) {
                        self.masterData.subPools = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getUserSubPools(),
                    function (result) {
                        self.masterData.userSubPools = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllColors(),
                    function (result) {
                        self.masterData.colors = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllMaterials(),
                    function (result) {
                        self.masterData.materials = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllPatterns(),
                    function (result) {
                        self.masterData.patterns = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllTrends().query(),
                    function (result) {
                        self.masterData.trends = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllSilhouettes(),
                    function (result) {
                        self.masterData.silhouettes = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllProductGroups(),
                    function (result) {
                        self.masterData.productGroups = result;
                    }
                );

                $scope.$load(
                    MasterDataService.getAllAttributeDefinitions(),
                    function (result) {
                        self.masterData.attributeDefinitions = result;
                    }
                );

                self.masterData.keyStyleFilterOptions = MasterDataService.getKeyStyleOptions();
            }

            function handleArticleOperationError(error, operation) {
                if (error.status === 404) {
                    alert($filter('translate')('exception.noModelFound') + ' ' + error.data);
                } else if (error.status === 423) {
                    alert($filter('translate')('exception.alreadySubmitted'));
                } else if (error.status === 408) {
                    alert($filter('translate')('exception.timeout'));
                } else {
                    alert($filter('translate')('exception.failed.' + operation));
                }
            }

            function tabIcon(article) {
                if (article.inProduction === true) {
                    return 'fa-lock lock-icon-color';
                } else if (article.enriched === true) {
                    return 'fa-check success-icon-color';
                } else if (article.enriched === false) {
                    return 'fa-times error-icon-color';
                }
            }

            function resetCurrentArticle() {
                self.currentArticle = {};
                self.currentAttrDefintions = [];
                self.selectedAttribute = null;
                self.extraTabSelectedConfig = {};
            }

            function isArticleSaveable() {
                return (self.currentArticle.modelSku && self.currentArticle.silhouetteCode) ? true : false;
            }

            function isArticleSubmitable() {
                return self.isArticleSaveable() && self.fullyEnriched === true;
            }

            function areAllConfigsInProduction() {

                if (!self.currentArticle.modelSku) {
                    return false;
                }

                return (self.currentArticle.inProduction === true) && self.currentArticle.configs && self.currentArticle.configs.every(function (config) {
                        return config.inProduction === true;
                    });
            }

            function shouldSaveButtonBeVisible() {
                return !self.areAllConfigsInProduction();
            }

            function shouldSubmitButtonBeVisible() {
                return !self.areAllConfigsInProduction() && self.currentArticle.submitable;
            }

            function shouldInfoLabelBeVisible() {
                if (!self.currentArticle.modelSku) {
                    return false;
                }

                return self.areAllConfigsInProduction() || !self.currentArticle.submitable;
            }

            function infoLabelTranslateKey() {
                if (self.areAllConfigsInProduction()) {
                    return 'article.editForm.info.allConfigsInProduction';
                } else if (!self.currentArticle.submitable) {
                    return 'article.editForm.info.allConfigsFullyEnriched';
                } else {
                    return '';
                }
            }


            /* Functions that are exposed*/

            /*Search article related*/
            self.resetFilterCriteria = resetFilterCriteria;
            self.selectFilterCriterion = selectFilterCriterion;
            self.formatBrandCode = formatBrandCode;
            self.formatSupplierCode = formatSupplierCode;
            self.formatSubPoolId = formatSubPoolId;
            self.searchArticles = searchArticles;
            self.onSearchFilterKeyPress = onSearchFilterKeyPress;
            self.loadMore = loadMore;
            self.comGroupHandler = comGroupHandler;

            /*article details related*/
            self.saveArticle = saveArticle;
            self.submitArticle = submitArticle;
            self.selectArticle = selectArticle;
            self.currentArticleLoaded = currentArticleLoaded;
            self.modelTabSelected = modelTabSelected;
            self.configTabSelected = configTabSelected;
            self.checkChangesSaved = checkChangesSaved;
            self.unselectArticle = unselectArticle;
            self.selectProductGroup = selectProductGroup;
            self.tabIcon = tabIcon;
            self.applyProductGroupSelection = applyProductGroupSelection;
            self.selectSilhouette = selectSilhouette;
            self.applySilhouetteSelection = applySilhouetteSelection;
            self.hasCurrentArticleNonGenericAttrValues = hasCurrentArticleNonGenericAttrValues;
            self.hasNonGenericAttributesValues = hasNonGenericAttributesValues;
            self.resetCurrentAttributes = resetCurrentAttributes;
            self.isOptionSelected = isOptionSelected;
            self.optionSelectable = optionSelectable;
            self.toggleAllOptions = toggleAllOptions;
            self.selectOption = selectOption;
            self.updateEnrichmentStatus = updateEnrichmentStatus;
            self.fillConfigAttrsWithValues = fillConfigAttrsWithValues;
            self.fillModelAttrsWithValues = fillModelAttrsWithValues;
            self.extractAttrValue = extractAttrValue;
            self.saveConfigAttributes = saveConfigAttributes;
            self.saveModelAttributes = saveModelAttributes;
            self.loadMasterData = loadMasterData;
            self.resetCurrentArticle = resetCurrentArticle;
            self.saveGenericAttribute = saveGenericAttribute;
            self.isArticleSaveable = isArticleSaveable;
            self.isArticleSubmitable = isArticleSubmitable;
            self.shouldSaveButtonBeVisible = shouldSaveButtonBeVisible;
            self.shouldSubmitButtonBeVisible = shouldSubmitButtonBeVisible;
            self.areAllConfigsInProduction = areAllConfigsInProduction;
            self.infoLabelTranslateKey = infoLabelTranslateKey;
            self.shouldInfoLabelBeVisible = shouldInfoLabelBeVisible;

            /* Functions that are called at initialization*/
            self.resetCurrentArticle();
            self.loadMasterData();
        }
    ]);

    var ModalInstanceCtrl = function ($scope, $modalInstance) {

        $scope.bodyTranslationKey = $modalInstance.bodyTranslationKey;

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
});
