////////////////////////////////////////////////////////////////////////////////
/**
 * @name settingsDirective
 * @namespace Directives
 * @desc Directive for the Settings view
 */

var settingsDirective = angular
    .module('settingsDirective', [])
    .controller('SettingsCtrl', SettingsCtrl)
    .directive('settingsView', settingsView);

function settingsView() {
    var directive = {
        templateUrl      : "settings/settings.html",
        restrict         : "E",
        replace          : true,
        bindToController : true,
        controller       : SettingsCtrl,
        controllerAs     : '_settings',
        link             : link,
        scope            : {}
    };
    return directive;
    function link(scope, element, attrs) {}
}

SettingsCtrl.$inject = [
    '$rootScope',
    '$scope',
    'ApiFactory',
    'AuthFactory'];

function SettingsCtrl(
    $rootScope, 
    $scope,
    ApiFactory,
    AuthFactory) {

     /** Init settingsDirective scope */
    /** --------------------------------------------------------------------- */
    var vm = this;
    vm.show_permissions = false;

    vm.passwords = {
        password_1 : '',
        password_2 : ''
    };

    vm.permissions = {
        view_alerts        : false,
        view_users         : false,
        update_alerts      : false,
        view_manage        : false,
        view_manage_terms  : false,
        view_priority_tags : false,
        view_historics     : false,
        view_terms         : false,
        view_urls          : false,
        view_tickers       : false
    }

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.updatePassword = updatePassword;
    ////////////////////////////////////////////////////////////////////////////

    var updatePermissions = function(perm) { // view_alerts
        vm.permissions[perm] = true;
    }

    var mapPermissions = function(res) {
        _.map(res.permissions, updatePermissions);
        vm.show_permissions = true;
    }

    ApiFactory.retrieveUserSettings().then(mapPermissions);

    function successPassword(res) {
        $rootScope.$emit("display.notification", 'Password successfully changed!', 'success', 4000);
    }

    function failedPassword(error) {
        $rootScope.$emit("display.notification", error, 'failure', 4000);
    }

    function updatePassword(passwords) {
        if (passwords.password_1 === passwords.password_2 && passwords.password_1.length > 1) {
            AuthFactory.reset_password(passwords.password_1).then(successPassword, failedPassword);
        } else {
            $rootScope.$emit("display.notification", 'Password successfully changed!', 'failure', 4000);
        }
    }    

}

module.exports = 'settingsDirective';