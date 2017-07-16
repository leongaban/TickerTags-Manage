(function () {
    'use strict';

    angular
        .module('admin.notification',[])
        .factory('Notification', Notification);

    Notification.$inject = ['$timeout', '$uibModal'];

    /* @ngInject */
    function Notification($timeout, $uibModal) {
        var service = {
            display: display
        };
        var message, type, show;
        return service;

        function display() {
            // console.log('notification service');
        }
    }

})();

