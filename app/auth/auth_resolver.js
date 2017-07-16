module.exports = angular.module('auth_module')
    .factory('AuthResolver', 
        ['$q', '$rootScope', '$location', 'AuthFactory',
        function ($q, $rootScope, $location, AuthFactory) {
            return {
                resolve: function() {
                    var deferred = $q.defer();
                    var unwatch  = $rootScope.$watch('currentUser', (currentUser) => {
                        if (angular.isDefined(currentUser)) {
                            if (currentUser) {
                                deferred.resolve(currentUser);
                            }
                            else {
                                AuthFactory.check_login().then((user) => {
                                    $rootScope.currentUser = user;
                                    deferred.resolve(user);
                                }, () => {
                                    deferred.reject();
                                    $location.path('/login');
                                });
                            }
                            unwatch();
                        }
                    });
                    return deferred.promise;
                }
            };
}]);