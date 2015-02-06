'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var social;
(function (social) {
    var Brand = (function () {
        function Brand() {
        }
        return Brand;
    })();
    social.Brand = Brand;
    var Image = (function () {
        function Image() {
        }
        return Image;
    })();
    social.Image = Image;
    var Media = (function () {
        function Media() {
        }
        return Media;
    })();
    social.Media = Media;
    var Article = (function () {
        function Article() {
        }
        return Article;
    })();
    social.Article = Article;
    var RatedArticle = (function () {
        function RatedArticle() {
        }
        return RatedArticle;
    })();
    social.RatedArticle = RatedArticle;
    var Comment = (function () {
        function Comment() {
        }
        return Comment;
    })();
    social.Comment = Comment;
    var Message = (function () {
        function Message() {
        }
        return Message;
    })();
    social.Message = Message;
    var ArticleSearchResult = (function (_super) {
        __extends(ArticleSearchResult, _super);
        function ArticleSearchResult() {
            _super.apply(this, arguments);
        }
        return ArticleSearchResult;
    })(social.RestResult);
    social.ArticleSearchResult = ArticleSearchResult;
    var ArticleFilterCriteria = (function () {
        function ArticleFilterCriteria() {
        }
        return ArticleFilterCriteria;
    })();
    social.ArticleFilterCriteria = ArticleFilterCriteria;
})(social || (social = {}));
//# sourceMappingURL=Article.js.map