'use strict';

define(['angular', 'angularMocks', 'petCommon'], function () {
    describe('Service: ', function () {
        var service;
        var codeNameDaraArray = [
            {code: 'code1', name: 'name1'},
            {code: 'code2', name: 'name2'},
            {code: 'code3', name: 'name3'}
        ];

        beforeEach(function () {
            module('petCommon');
            module('ngResource');
            inject(function ($injector) {
                service = $injector.get('MasterDataService');
            });
        });

        it('should load stuff', function () {
                expect(service).toBeDefined();
            }
        );

        describe('displayNameForCode', function () {
            it('should return undefined if code is undefined', inject(function () {
                expect(service.displayNameForCode()).toBe(undefined);
            }));

            it('should return code if dataArray is undefined', inject(function () {
                expect(service.displayNameForCode(null, 'code')).toBe('code');
            }));

            it('should return code if dataArray is []', inject(function () {
                expect(service.displayNameForCode([], 'code')).toBe('code');
            }));

            it('should return code if dataArray is []', inject(function () {
                expect(service.displayNameForCode(codeNameDaraArray, 'code2')).toBe('name2');
            }));
        });


        describe('displayTextForCode', function () {
            it('should return undefined if code is undefined', inject(function () {
                expect(service.displayTextForCode()).toBe(undefined);
            }));

            it('should return code if dataArray is undefined', inject(function () {
                expect(service.displayTextForCode(null, 'code')).toBe('code');
            }));

            it('should return code if dataArray is []', inject(function () {
                expect(service.displayTextForCode([], 'code')).toBe('code');
            }));

            it('should return code if dataArray is []', inject(function () {
                expect(service.displayTextForCode(codeNameDaraArray, 'code3')).toBe('name3 (code3)');
            }));
        });
    });
});