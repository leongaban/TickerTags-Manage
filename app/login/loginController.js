/*global angular*/
////////////////////////////////////////////////////////////////////////////////
/**
 * @name LoginController
 * @namespace Controller
 * @desc Controls the Login View
 */

var loginController = angular
    .module('loginController', [])
    .controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$location',
    'ApiFactory',
    'AUTH_EVENTS',
    'AuthFactory'];

function LoginCtrl(
    $rootScope,
    $scope,
    $location,
    ApiFactory,
    AUTH_EVENTS,
    AuthFactory) {

    /** Init LoginCtrl scope */
    /** --------------------------------------------------------------------- */
    var vs = $scope;

    // Hoisted functions ///////////////////////////////////////////////////////
    vs.login = login;
    ////////////////////////////////////////////////////////////////////////////

    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function (event, data) {
        $rootScope.currentUser = null;
        $scope.currentUser     = null;
        AuthFactory.logout();
        $location.path('/login');
    });

    function login(credentials) {
        // console.log('credentials',credentials);
        AuthFactory.login(credentials).then(function (user) {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            // console.log('user',user);

            if (user.password_reset) {
                $location.path('/password');
            } else {
                $location.path('/tickers');
            }
        }, function () {
            $scope.loginData.message = "Invalid Username/Password";
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        }, function () {
            $scope.loginData.message = "Invalid Username/Password";
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    }
}

module.exports = loginController;