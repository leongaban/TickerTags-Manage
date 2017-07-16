/*global angular*/
////////////////////////////////////////////////////////////////////////////////
/**
 * @name notificationsDirective 
 * @namespace Directive
 * @desc Controls the Dashboard notification messages
 */


var notifications = angular
    .module('notificationsDirective', [])
    .directive('notifications', notifications);

function notifications() {
    return {
        templateUrl      : "notifications/notifications.html",
        restrict         : 'E',
        replace          : true,
        bindToController : true,
        controller       : NotificationsCtrl,
        controllerAs     : 'note',
        scope            : {}
    };
}

NotificationsCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$timeout'];

function NotificationsCtrl (
    $rootScope,
    $scope,
    $timeout) {

    const vm = this;
          vm.note_message = '';
          vm.note_type    = '';
          vm.showNote     = false;

    // Function Expressions ////////////////////////////////////////////////////
    const timeoutMsg = () => { vm.showNote = false; };
    
    const setupNotification = (msg, status, secs = secs || 4000) => {       
        vm.note_message = msg;
        vm.note_type    = status;
        vm.showNote     = true;
        $timeout(timeoutMsg, secs);
    };

    const closeNotification = () => { vm.showNote = false; };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on("display.notification", (event, msg, status, secs) => setupNotification(msg, status, secs));

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.timeoutMsg        = timeoutMsg;
    vm.closeNotification = closeNotification;
    vm.setupNotification = setupNotification;
}

module.exports = notifications;