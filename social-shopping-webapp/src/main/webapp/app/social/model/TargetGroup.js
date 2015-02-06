/// <reference path='../../_all.ts' />
'use strict';
var social;
(function (social) {
    var TargetGroup = (function () {
        function TargetGroup(code, name) {
            this.code = code;
            this.name = name;
        }
        return TargetGroup;
    })();
    social.TargetGroup = TargetGroup;
})(social || (social = {}));
//# sourceMappingURL=TargetGroup.js.map