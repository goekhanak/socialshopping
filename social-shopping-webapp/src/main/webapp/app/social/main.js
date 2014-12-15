define('socialShoppingModule', ['angular', 'petCommon'],
    function (angular) {
        'use strict';

        return angular.module('socialShopping', ['petCommon']);
    }
);

define('socialShopping', ['socialShoppingModule',
        './SocialController'
    ],
    function (module) {
        'use strict';

        return module;
    }
);
