'use strict';

define(['angular', 'angularMocks', 'petCommon'], function () {
    describe('MasterDataFilter: ', function () {

        var colorName = 'blue';
        var colorCode = '201';

        beforeEach(function(){
            module('petCommon');
            // example of mock injection
            module(function($provide){
                var mockMasterDataService = {
                    displayTextForColorCode: function (code) {
                        return  colorName+' ('+ code + ')';
                    }
                };
                $provide.value('MasterDataService',mockMasterDataService);
            });
        });

        describe('configSkuFilter', function () {
            it('should return undefined if configSku is undefined', inject(function (configSkuSuffixFilter) {
                expect(configSkuSuffixFilter(undefined)).toBe(undefined);
            }));

            it('should return config suffix if configSku contains -  ', inject(function (configSkuSuffixFilter) {
                expect(configSkuSuffixFilter('MODEL-CONFIG')).toBe('CONFIG');
            }));

            it('should return same string if configSku does not contain - ', inject(function (configSkuSuffixFilter) {
                expect(configSkuSuffixFilter('MODEL')).toBe('MODEL');
            }));
        });

        describe('zalandoPriceFilter', function () {
            it('should return formatted price for 100 cents EUR currency', inject(function (zalandoPriceFilter) {
                expect(zalandoPriceFilter(100, 'EUR')).toBe('€ 1.00');
            }));

            it('should return formatted price for 2450 cents USD currency', inject(function (zalandoPriceFilter) {
                expect(zalandoPriceFilter(2450, 'USD')).toBe('$ 24.50');
            }));

            it('should return formatted price for 0 cents XYZ currency', inject(function (zalandoPriceFilter) {
                expect(zalandoPriceFilter(0, 'XYZ')).toBe('XYZ 0.00');
            }));
        });


        describe('colorDisplayFilter', function () {
            it('should return formatted price for 100 cents EUR currency', inject(function (colorDisplayFilter) {
                expect(colorDisplayFilter(colorCode)).toBe(colorName+' ('+colorCode+')');
            }));
        });

    });
});