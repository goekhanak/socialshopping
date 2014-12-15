define(['petCommonModule'], function (module) {
    'use strict';

    module.factory('Session', [

        function () {
            this.create = function (username, authorities, privileges) {
                this.username = username;
                this.authorities = authorities;
                this.privileges = privileges;
                return this;
            };
            this.invalidate = function () {
                this.username = null;
                this.authorities = null;
                this.privileges = null;
            };
            return this;
        }
    ]);
});
