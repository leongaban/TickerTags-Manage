////////////////////////////////////////////////////////////////////////////////
/**
 * @name AuthFactory
 * @namespace Factory
 * @desc Handles user Authentication
 */

module.exports = angular
    .module('auth_module', [])
    .factory('AuthFactory', factory);

factory.$inject = ['$http', 'Session', 'ApiFactory', 'UsersFactory'];

function factory($http, Session, ApiFactory, UsersFactory) {

    const apiError = ApiFactory.apiError;
    let user = { that: this };

    ////////////////////////////////////////////////////////////////////////////
    const login = credentials => {
        return ApiFactory.userLogin(credentials.username, credentials.password).then(res => {
            Session.create(res.data.session_id,
                           res.data.user.username,
                           res.data.user.role);
            return res.data.user;
        });
    };

    const logout = () => Session.destroy();

    function check_login() {
        return ApiFactory.getUserDetails().then(res => {
            Session.create(res.data.session_id,
                           res.data.user.username,
                           res.data.user.role);
            return res.data.user;
        }).catch(apiError);
    };

    const reset_password = password => $http.put('/app/api/login/password', { password: password }).then(res => res).catch(apiError);

    const saveUser = username => user.that = username;

    const getUser = () => user.that;

    const isCurator = () => !!Session.userRole;
 
    const isAuthorized = authorizedRoles => {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }

        return (authFactory.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    const isAuthenticated = () => !!Session.userId;

    const webservice_logout = () => {
        Session.destroy();
        return $http.delete('/app/api/login');
    };

    ////////////////////////////////////////////////////////////////////////////
    return {
        login             : login,
        logout            : logout,
        check_login       : check_login,
        reset_password    : reset_password,
        saveUser          : saveUser,
        getUser           : getUser,
        isCurator         : isCurator,
        isAuthorized      : isAuthorized,
        isAuthenticated   : isAuthenticated,
        webservice_logout : webservice_logout
    };
}