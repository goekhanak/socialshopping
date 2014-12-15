'use strict';

define(['angular', 'angularMocks', 'petEnrichment'], function () {
    describe('EnrichmentController: ', function () {
        var scope, createController, $q, ctrl, cons;


        beforeEach(function () {
            module('petEnrichment');
            module('ngResource');
            inject(
                function ($injector) {
                    scope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cons = $injector.get('cons');

                    scope.currentUser = {
                        'permissions': {
                            'criticality': {
                                'write': true
                            },
                            'risk': {
                                'read': true
                            }
                        }
                    };
                    scope.permit = function () {
                        return true;
                    };


                    var $controller = $injector.get('$controller');
                    createController = function createController() {
                        return $controller('EnrichmentController', {
                            '$scope': scope
                        });
                    };
                }
            );
        });

        it('should load stuff', function () {
                expect(createController).toBeDefined();
            }
        );

        describe('resetCurrentArticle()', function () {

            beforeEach(function () {
                ctrl = createController();
            });

            it('should have default current article values', inject(function () {
                expect(ctrl.currentArticle).toEqual({});
                expect(ctrl.currentAttrDefintions).toEqual([]);
                expect(ctrl.selectedAttribute).toBe(null);
            }));

            it('should reset current article values', function () {
                ctrl.currentArticle = -1;
                ctrl.currentAttrDefintions = -1;
                ctrl.selectedAttribute = -1;

                ctrl.resetCurrentArticle();

                expect(ctrl.currentArticle).toEqual({});
                expect(ctrl.currentAttrDefintions).toEqual([]);
                expect(ctrl.selectedAttribute).toBe(null);
            });
        });

        describe('tabIcon()', function () {
            var article;
            beforeEach(function () {
                ctrl = createController();

                article = {
                    inProduction: true,
                    enriched: true
                };
            });


            it('should  return in production css when article.inProduction = true ', function () {
                expect(ctrl.tabIcon(article)).toBe('fa-lock lock-icon-color');
            });

            it('should  return in enriched css when inProduction = false and enriched = true  ', function () {
                article.inProduction = false;
                expect(ctrl.tabIcon(article)).toBe('fa-check success-icon-color');
            });

            it('should tabIcon return in enriched css when inProduction = false and enriched = true  ', function () {
                article.inProduction = false;
                article.enriched = false;
                expect(ctrl.tabIcon(article)).toBe('fa-times error-icon-color');
            });
        });


        describe('updateEnrichmentStatus()', function () {

            var attr1, attr2;
            beforeEach(function () {
                ctrl = createController();

                attr1 = {required: false, values: []};
                attr2 = {required: true, values: []};

                ctrl.currentAttrDefintions = [
                    attr1, attr2
                ];
                ctrl.currentDisplayedArticle = {};
                ctrl.currentArticle = {
                    configs: []
                };
            });

            it('should currentDisplayedArticle.enriched true with empty attrs ', function () {
                ctrl.currentAttrDefintions = [];
                ctrl.updateEnrichmentStatus();
                expect(ctrl.currentDisplayedArticle.enriched).toBe(true);
            });

            it('should currentDisplayedArticle.enriched false with required attr and empty values', function () {
                ctrl.updateEnrichmentStatus();
                expect(ctrl.currentDisplayedArticle.enriched).toBe(false);
            });


            it('should currentDisplayedArticle.enriched true with required attr and some values ', function () {
                attr2.values.push('value1');
                ctrl.updateEnrichmentStatus();
                expect(ctrl.currentDisplayedArticle.enriched).toBe(true);
            });

            it('should currentDisplayedArticle.enriched false with null silhouetteCode and model ', function () {
                ctrl.currentDisplayedArticle.modelSku = 'N1243A0C3';
                ctrl.currentDisplayedArticle.silhouetteCode = null;
                attr2.required = false;
                ctrl.updateEnrichmentStatus();
                expect(ctrl.currentDisplayedArticle.enriched).toBe(false);
            });

            it('should fullyEnriched false with default values ', function () {
                ctrl.updateEnrichmentStatus();
                expect(ctrl.fullyEnriched).toBe(false);
            });

            it('should fullyEnriched true with currentArticle.inProduction = true ', function () {
                ctrl.currentArticle.inProduction = true;
                ctrl.updateEnrichmentStatus();
                expect(ctrl.fullyEnriched).toBe(true);
            });

            it('should fullyEnriched false with currentArticle.inProduction = false ', function () {
                ctrl.currentArticle.inProduction = false;
                ctrl.updateEnrichmentStatus();
                expect(ctrl.fullyEnriched).toBe(false);
            });

            it('should fullyEnriched true with currentArticle.enriched = true ', function () {
                ctrl.currentArticle.inProduction = false;
                ctrl.currentArticle.enriched = true;
                ctrl.updateEnrichmentStatus();
                expect(ctrl.fullyEnriched).toBe(true);
            });

            it('should fullyEnriched false with not enriched config', function () {
                ctrl.currentArticle.inProduction = true;
                ctrl.currentArticle.enriched = true;
                ctrl.currentArticle.configs.push({
                    inProduction: false,
                    enriched: false
                });

                ctrl.updateEnrichmentStatus();
                expect(ctrl.fullyEnriched).toBe(false);
            });

            it('should fullyEnriched true with enriched config ', function () {
                ctrl.currentArticle.inProduction = true;
                ctrl.currentArticle.enriched = true;
                ctrl.currentArticle.configs.push({
                    inProduction: true,
                    enriched: false
                });

                ctrl.updateEnrichmentStatus();
                expect(ctrl.fullyEnriched).toBe(true);
            });


        });


        describe('saveGenericAttribute()', function () {
            var article, attrs;
            beforeEach(function () {
                ctrl = createController();

                article = {
                    inProduction: true,
                    enriched: true
                };

                var nonGenericAttr = {
                    id: 'id',
                    generic: false
                };

                var ageGroupAttr = {
                    id: cons.AGE_GROUP,
                    generic: true,
                    multiselect: true,
                    values: [{code: {code: 'KID'}}, {code: {code: 'BABY'}}]
                };

                var Trend1Attr = {
                    id: cons.TREND_1,
                    generic: true,
                    multiselect: false,
                    values: [{code: {code: '80s'}}]
                };

                attrs = [nonGenericAttr, ageGroupAttr, Trend1Attr];
            });

            it('should save AGE_GROUP values to model', function () {
                ctrl.saveGenericAttribute(article, attrs, cons.AGE_GROUP);
                expect(article[cons.AGE_GROUP]).toEqual(['KID', 'BABY']);
            });

            it('should save TREND_1 values to config', function () {
                ctrl.saveGenericAttribute(article, attrs, cons.TREND_1);
                expect(article[cons.TREND_1]).toEqual('80s');
            });
        });

        describe('optionSelectable()', function () {
            var option = {};
            beforeEach(function () {
                ctrl = createController();

                ctrl.selectedAttribute = {
                    id: cons.AGE_GROUP,
                    generic: true,
                    multiselect: true,
                    values: [{code: {code: cons.AGE_GROUP_KID}}, {code: {code: cons.AGE_GROUP_BABY}}]
                };
            });

            it('should return true when selectedAttribute is not AGE_GROUP', function () {
                ctrl.selectedAttribute.id = cons.GENDER;
                expect(ctrl.optionSelectable(option)).toBe(true);
            });

            it('should return true when selectedAttribute has no previous values', function () {
                ctrl.selectedAttribute.values = [];
                expect(ctrl.optionSelectable(option)).toBe(true);
            });

            it('should return true when selectedAttribute has already have the option', function () {
                option = ctrl.selectedAttribute.values[0];
                expect(ctrl.optionSelectable(option)).toBe(true);
            });

            it('should return true when selectedAttribute has values in the same restriction set with option', function () {
                option = {code: {code: cons.AGE_GROUP_TEEN}};
                expect(ctrl.optionSelectable(option)).toBe(true);
            });

            it('should return false when selectedAttribute has values in the different restriction set with option', function () {
                option = {code: {code: cons.AGE_GROUP_ADULT}};
                expect(ctrl.optionSelectable(option)).toBe(false);
            });
        });

        describe('selectOption()', function () {
            var option;
            beforeEach(function () {
                ctrl = createController();

                ctrl.currentAttrDefintions = [];
                ctrl.currentDisplayedArticle = {};
                ctrl.currentArticle = {
                    inProduction: true,
                    configs: []
                };

                ctrl.selectedAttribute = {
                    id: cons.AGE_GROUP,
                    generic: true,
                    multiselect: true,
                    values: []
                };

                option = {code: {code: cons.AGE_GROUP_BABY}};
            });

            it('should add the new option from multiselect attribute', function () {
                ctrl.selectOption(option);
                expect(ctrl.dirty).toBe(true);
                expect(ctrl.selectedAttribute.values).toContain(option);
                expect(ctrl.fullyEnriched).toBe(true);
            });

            it('should remove the existing option from multiselect attribute ', function () {
                ctrl.selectedAttribute.values.push(option);
                ctrl.selectOption(option);
                expect(ctrl.dirty).toBe(true);
                expect(ctrl.selectedAttribute.values).not.toContain(option);
                expect(ctrl.fullyEnriched).toBe(true);
            });

            it('should add the new option from non multiselect attribute', function () {
                ctrl.selectedAttribute.multiselect = false;
                ctrl.selectedAttribute.values.push({code: {code: cons.AGE_GROUP_KID}});
                ctrl.selectOption(option);
                expect(ctrl.dirty).toBe(true);
                expect(ctrl.selectedAttribute.values).toContain(option);
                expect(ctrl.selectedAttribute.values.length).toBe(1);
                expect(ctrl.fullyEnriched).toBe(true);
            });


            it('should remove the existing option from non multiselect attribute ', function () {
                ctrl.selectedAttribute.multiselect = false;
                ctrl.selectedAttribute.values.push(option);
                ctrl.selectOption(option);
                expect(ctrl.dirty).toBe(true);
                expect(ctrl.selectedAttribute.values.length).toBe(0);
                expect(ctrl.fullyEnriched).toBe(true);
            });

            it('should not select attibute since option is not selectable', function () {
                ctrl.selectedAttribute.values.push({code: {code: cons.AGE_GROUP_ADULT}});
                ctrl.selectOption(option);
                expect(ctrl.dirty).toBe(false);
                expect(ctrl.selectedAttribute.values).not.toContain(option);
            });
        });


        describe('disableButtons', function () {
            beforeEach(function () {
                ctrl = createController();

                ctrl.currentArticle = {
                    modelSku: 'modelSku',
                    silhouetteCode: 'silhouetteCode'
                };

                ctrl.fullyEnriched = true;
            });

            it('isArticleSaveable() should return true when modelSku and silhouetteCode exists', function () {
                expect(ctrl.isArticleSaveable()).toBe(true);
            });

            it('isArticleSaveable() should return false when modelSku empty', function () {
                ctrl.currentArticle.modelSku = null;
                expect(ctrl.isArticleSaveable()).toBe(false);
            });

            it('isArticleSaveable() should return false when silhouetteCode empty', function () {
                ctrl.currentArticle.silhouetteCode = null;
                expect(ctrl.isArticleSaveable()).toBe(false);
            });

            it('isArticleSubmitable() should return true when modelSku, silhouetteCode  exists and fullyEnriched = true', function () {
                expect(ctrl.isArticleSubmitable()).toBe(true);
            });

            it('isArticleSubmitable() should return false when modelSku empty', function () {
                ctrl.currentArticle.modelSku = null;
                expect(ctrl.isArticleSubmitable()).toBe(false);
            });

            it('isArticleSubmitable() should return false when when silhouetteCode empty', function () {
                ctrl.currentArticle.silhouetteCode = null;
                expect(ctrl.isArticleSubmitable()).toBe(false);
            });

            it('isArticleSubmitable() should return false when when fullyEnriched = false', function () {
                ctrl.fullyEnriched = false;
                expect(ctrl.isArticleSubmitable()).toBe(false);
            });
        });

        describe('Buttons Visible', function () {
            beforeEach(function () {
                ctrl = createController();

                ctrl.currentArticle = {
                    modelSku: 'modelSku',
                    silhouetteCode: 'silhouetteCode',
                    inProduction: true,
                    submitable: false,
                    configs: [{inProduction: true}]
                };

                ctrl.fullyEnriched = true;
            });

            it('areAllConfigsInProduction() should return true when all configs are in production', function () {
                expect(ctrl.areAllConfigsInProduction()).toBe(true);
            });

            it('areAllConfigsInProduction() should return false when model sku is null', function () {
                ctrl.currentArticle = {};
                expect(ctrl.areAllConfigsInProduction()).toBe(false);
            });

            it('areAllConfigsInProduction() should return false when a config is not in production', function () {
                ctrl.currentArticle.configs.push({inProduction: false});
                expect(ctrl.areAllConfigsInProduction()).toBe(false);
            });

            it('shouldSaveButtonBeVisible() should return false when all configs are in production', function () {
                expect(ctrl.shouldSaveButtonBeVisible()).toBe(false);
            });

            it('shouldSubmitButtonBeVisible() should return true when all configs are in production', function () {
                expect(ctrl.shouldSubmitButtonBeVisible()).toBe(false);
            });

            it('shouldSubmitButtonBeVisible() should return false when currentArticle.submitable is true', function () {
                ctrl.currentArticle.configs.push({inProduction: false});
                ctrl.currentArticle.submitable = true;
                expect(ctrl.shouldSubmitButtonBeVisible()).toBe(true);
            });

            it('shouldInfoLabelBeVisible() should return false when model sku is null', function () {
                ctrl.currentArticle = {};
                expect(ctrl.shouldInfoLabelBeVisible()).toBe(false);
            });

            it('shouldInfoLabelBeVisible() should return true when all configs are in production', function () {
                expect(ctrl.shouldInfoLabelBeVisible()).toBe(true);
            });

            it('shouldInfoLabelBeVisible() should return true when currentArticle.submitable is false ', function () {
                ctrl.currentArticle.configs.push({inProduction: false});
                expect(ctrl.shouldInfoLabelBeVisible()).toBe(true);
            });

            it('shouldInfoLabelBeVisible() should return false when currentArticle.submitable is true and all configs are in production ', function () {
                ctrl.currentArticle.configs.push({inProduction: false});
                ctrl.currentArticle.submitable = true;
                expect(ctrl.shouldInfoLabelBeVisible()).toBe(false);
            });

            it('should infoLabelTranslateKey() should return article.editForm.info.allConfigsInProduction when all configs are in production', function () {
                expect(ctrl.infoLabelTranslateKey()).toBe('article.editForm.info.allConfigsInProduction');
            });

            it('should infoLabelTranslateKey() should return article.editForm.info.allConfigsFullyEnriched when currentArticle.submitable is false', function () {
                ctrl.currentArticle.configs.push({inProduction: false});
                expect(ctrl.infoLabelTranslateKey()).toBe('article.editForm.info.allConfigsFullyEnriched');
            });

            it('should infoLabelTranslateKey() should return empty string when currentArticle.submitable is true and all configs are in production ', function () {
                ctrl.currentArticle.configs.push({inProduction: false});
                ctrl.currentArticle.submitable = true;
                expect(ctrl.infoLabelTranslateKey()).toBe('');
            });
        });


        describe('hasCurrentArticleNonGenericAttrValues()', function () {
            var genericAttrWithValues, nonGenericAttrWithoutValues, nonGenericAttrWithValues;

            beforeEach(function () {
                ctrl = createController();

                ctrl.currentArticle = {
                    configs: []
                };

                ctrl.modelAttributes = [];

                ctrl.configAttributes = [];

                genericAttrWithValues = {
                    generic: true,
                    values: ['value1']
                };

                nonGenericAttrWithoutValues = {
                    values: []
                };

                nonGenericAttrWithValues = {
                    values: ['value1', 'value2']
                };
            });


            it('should return false when currentArticle = null', function () {
                ctrl.currentArticle = null;
                expect(ctrl.hasCurrentArticleNonGenericAttrValues()).toBe(false);
            });

            it('should return false when no attributes', function () {
                expect(ctrl.hasCurrentArticleNonGenericAttrValues()).toBe(false);
            });

            it('should return false with generic and non empty value attributes', function () {
                ctrl.modelAttributes.push(genericAttrWithValues);
                ctrl.modelAttributes.push(nonGenericAttrWithoutValues);

                ctrl.configAttributes =
                {
                    'EA254A00G-C11': [genericAttrWithValues, nonGenericAttrWithoutValues]
                };

                ctrl.currentArticle.configs.push(
                    {'configSku': 'EA254A00G-C11'}
                );

                expect(ctrl.hasCurrentArticleNonGenericAttrValues()).toBe(false);
            });

            it('should return true with model non generic model attribute with values', function () {
                ctrl.modelAttributes.push(nonGenericAttrWithValues);
                expect(ctrl.hasCurrentArticleNonGenericAttrValues()).toBe(true);
            });

            it('should return true with non generic config attribute with values', function () {
                ctrl.configAttributes =
                {
                    'EA254A00G-C11': [nonGenericAttrWithValues]
                };

                ctrl.currentArticle.configs.push(
                    {'configSku': 'EA254A00G-C11'}
                );

                expect(ctrl.hasCurrentArticleNonGenericAttrValues()).toBe(true);
            });
        });


    });
});