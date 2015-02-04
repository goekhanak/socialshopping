'use strict';

module social{

    export class Brand{
        name: string;
    }

    export class Image{
        smallUrl: string;
        smallHDUrl: string;
    }

    export class Media{
        images: Array<Image>;
    }

    export class Article{
        id: string;
        name: string;
        shopUrl: string;
        brand: Brand;
        media: Media;
        units: Array<{price:{formatted:string}}>
    }

    export class RatedArticle implements AngularFireSimpleObject {
        $id: string;
        $priority: number;
        $value: any;
        [key: string]: any;

        id: string;
        name: string;
        shopUrl: string;
        brandName: string;
        thumbnailUrl: string;
        price: string;
        thumbsUp: Array<any>;
        thumbsDown: Array<any>;

        comments: Array<Comment>;
    }

    export class Comment{
        content: string;
        postedBy: string;
        postedDate: number;
        userImg: string;
    }

    export class Message{
        content: string;
        postedBy: string;
        postedDate: number;
        userImg: string;
    }


    export class ArticleSearchResult extends RestResult{
        content: Array<Article>;
    }

    export class ArticleFilterCriteria{
        category : Category;
        articleName : string;
    }
}