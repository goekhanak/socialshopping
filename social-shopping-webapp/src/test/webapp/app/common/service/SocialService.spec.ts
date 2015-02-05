/// <reference path='../../../_all_test.ts' />


'use strict';

define(['angular', 'angularMocks', 'petCommon'], function () {
    describe('Shop Service: ', function () {
        var service: social.ShopService;

        beforeEach(function () {
            module('petCommon');
            module('ngResource');
            inject(function ($injector) {
                service = $injector.get('ShopService');
            });
        });

        it('should load stuff', function () {
                expect(service).toBeDefined();
            }
        );

        describe('getTargetGroups', function () {
            it('should return an array with 3 target groups', inject(function () {
                var targetGroups = servi
                expect(targetGroups).toBeDefined();
                expect(targetGroups.length).toEqual(3);
            }));
        });
    });
});