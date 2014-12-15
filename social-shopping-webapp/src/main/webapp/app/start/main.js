define('petStartModule', ['angular', 'petCommon'],
    function (angular) {
        'use strict';

        return angular.module('petStart', ['petCommon']);
    }
);

define('petStart', ['petStartModule',
        './LoginController',
        './LogoutController',
        './StartController'
    ],
    function (module) {
        'use strict';

        return module;
    }
);
