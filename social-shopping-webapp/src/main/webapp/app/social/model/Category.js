'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var social;
(function (social) {
    var RestResult = (function () {
        function RestResult() {
        }
        return RestResult;
    })();
    social.RestResult = RestResult;
    var Category = (function () {
        function Category() {
        }
        return Category;
    })();
    social.Category = Category;
    var CategorySearchResult = (function (_super) {
        __extends(CategorySearchResult, _super);
        function CategorySearchResult() {
            _super.apply(this, arguments);
        }
        return CategorySearchResult;
    })(RestResult);
    social.CategorySearchResult = CategorySearchResult;
})(social || (social = {}));
//# sourceMappingURL=Category.js.map