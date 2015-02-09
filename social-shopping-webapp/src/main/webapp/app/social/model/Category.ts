'use strict';
module social{

    export class RestResult{
        $promise:any;
    }

    export class Category{
        name: string;
        key: string;
        parentKey: string;
        childKeys : Array<string>;
    }

    export class CategorySearchResult extends RestResult{
        content: Array<Category>;
    }
}

