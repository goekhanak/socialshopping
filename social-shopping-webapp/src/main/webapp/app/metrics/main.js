define('petMetricsModule', ['angular', 'petCommon'],
    function (angular) {
        'use strict';

        return angular.module('petMetrics', ['petCommon']);
    }
);

define('petMetrics', ['petMetricsModule',
        './MetricsController',
        './MetricsService',
        './HealthCheckService'
    ],
    function (module) {
        'use strict';

        return module;
    }
);
