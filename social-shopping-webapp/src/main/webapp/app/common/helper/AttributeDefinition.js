define(['petCommonModule'], function (module) {
    'use strict';

    module.factory('AttributeDefinition', [

        function () {
            this.create = function (id, name) {
                this.id = id;
                this.name = name;
                return this;
            };
            return this;
        }
    ]);
});
