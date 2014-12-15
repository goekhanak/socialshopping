define('petEnrichmentModule', ['angular', 'petCommon'],
    function (angular) {
        'use strict';

        return angular.module('petEnrichment', ['petCommon']);
    }
);

define('petEnrichment', ['petEnrichmentModule',
        './EnrichmentController'
    ],
    function (module) {
        'use strict';

        return module;
    }
);
