define('petLogsModule', ['angular', 'petCommon'],
    function (angular) {
        'use strict';

        return angular.module('petLogs', ['petCommon']);
    }
);

define('petLogs', ['petLogsModule',
        './LogsController',
        './LogsService'
    ],
    function (module) {
        'use strict';

        return module;
    }
);
