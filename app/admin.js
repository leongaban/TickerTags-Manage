/*global angular*/
/** ============================================================================
----------------------------------------------------------------------------- */

/**
 * TickerTags Admin App
 * @namespace Controller
 * @desc Injects all modules and controls the $rootScope
 * @summary "All change is detectable."
 * @copyright TickerTags 2016
 */

/** ----------------------------------------------------------------------------
============================================================================= */
// https://github.com/johnpapa/angular-styleguide
"use strict";

var app = angular.module('admin', [
    'ui.router',
    'ui.bootstrap',
    'ngSanitize',
    'ngCsv',
    'constants_module',
    'addTagButtonComponent',
    'auth_module',
    'admin_module',
    'admin.notification',
    'analyticsComponent',
    'apiFactory',
    'bulkAddComponent',
    'capitalizeDirective',
    'chooseTickerListComponent',
    'templateCache',
    'loginController',
    'indexController',
    'navComponent',
    'notificationsDirective',
    'overlayDirective',
    'tags_module',
    'bulk_terms_module',
    'tickersDirective',
    'tickersFactory',
    'tickerDetailsFactory',
    'reportedTagsDirective',
    'reportedTagsFactory',
    'massActionsModalDirective',
    'quarterlyReportsDirective',
    'quarterlyReportComponent',
    'tagsModule',
    'tagsFactory',
    'usersDirective',
    'usersFactory',
    'restDirective',
    'restFactory',
    'restModalDirective',
    'topicsDirective',
    'settingsDirective',
    'utilityService'
])

// Ionic uses AngularUI Router which uses the concept of states
// Learn more here: https://github.com/angular-ui/ui-router
// Set up the various states which the app can be in.
// Each state's controller can be found in controllers.js
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "login/login.html",
            data: { authorizedRoles: ['All'] }
        })
        .state('tickers', {
            url: "/tickers",
            templateUrl: "tickers/view/tickers_container.html",
            data: { authorizedRoles: ['All'] },
        })
        .state('quarterly_reports', {
            url: "/quarterly_reports",
            templateUrl: "tickers/quarterly_reports_container.html",
            data: { authorizedRoles: ['All'] }
        })
        .state('tags', {
            name: 'tags',
            url: "/tags?ticker?term",
            templateUrl: "tags/view/tags_container.html",
            data: { authorizedRoles: ['All'] },
            params: {
                search: null,
                ticker: null,
                term: null
            }
        })
        .state('reported_tags', {
            url: "/reports",
            templateUrl: "tags/view/reported_tags_container.html",
            data: { authorizedRoles: ['All'] }
        })
        .state('bulk_add', {
            url: "/bulk_add",
            templateUrl: "bulk/view/bulk_add_container.html",
            data: { authorizedRoles: ['All'] }
        })
        .state('bulk_terms', {
            url: "/bulk_terms",
            templateUrl: "tags/bulk/bulk_terms_container.html",
            data: { authorizedRoles: ['All'] }
        })
        .state('analytics', {
            url: "/analytics",
            templateUrl: "analytics/analytics_container.html",
            bindToController: true,
            controller: function(reports){
                this.reports = reports.data.reports;
            },
            controllerAs: 'ac',
            data: { authorizedRoles: ['Admin'] },
            resolve:{
                reports: function(ApiFactory) {
                    return ApiFactory.getReports();
                }
            }
        })
        .state('users', {
            url: "/users",
            templateUrl: "users/users_container.html",
            data: { authorizedRoles: ['Admin'] }
        })
        .state('rest', {
            url: "/rest",
            templateUrl: "rest/rest_container.html",
            data: { authorizedRoles: ['Admin'] }
        })
        .state('topics', {
            url: "/topics",
            templateUrl: "topics/topics_container.html",
            data: { authorizedRoles: ['Admin'] }
        })
        .state('admin', {
            url: "/admin",
            templateUrl: "admin/admin_container.html",
            data: { authorizedRoles: ['Admin'] }
        })
        .state('settings', {
            url: "/settings",
            templateUrl: "settings/settings_container.html",
            data: { authorizedRoles: ['All'] }
        });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
}])

.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.interceptors.push(['$injector', function ($injector) {
        return $injector.get('AuthInterceptor');
    }]);
}])

.factory('AuthInterceptor', 
    ['$rootScope', '$q', 'AUTH_EVENTS', '$location',
    function ($rootScope, $q, AUTH_EVENTS, $location) {
        return {
            responseError: function (response) { 
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout
                }[response.status], response);
                    if (response.status == 401) {
                        $location.path('/login');
                    }
                    return $q.reject(response);
            }
        };
}])

.run(['$rootScope', 'AUTH_EVENTS', 'AuthFactory', '$location',
    function ($rootScope, AUTH_EVENTS, AuthFactory, $location) {
        $rootScope.$on('$routeChangeStart',
        function (event, next) {
            // console.log('next ', next.data.authorizedRoles);
            var authorizedRoles = next.data.authorizedRoles;

            if (!AuthFactory.isAuthorized(authorizedRoles)) {
                event.preventDefault();

                // user is not allowed
                if (AuthFactory.isAuthenticated()) {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                    $location.path('/denied');

                // user is not logged in
                } else {
                    $rootScope.ifLoggedOut = true;

                    AuthFactory.check_login().then((user) => {

                        // location.reload();
                        $rootScope.ifLoggedOut = false;

                        if (user.role === 'Curator') {
                            $rootScope.isCurator = true;
                        }

                        $rootScope.currentUser = user;
                        $rootScope.username    = user.username;
                        console.log('$rootScope.username',$rootScope.username);

                    }, () => {
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                        $location.path('/login');
                    });
                }
            }
        });
}])

.service('Session', function () {
    this.create = function(sessionId, userId, userRole) {
        this.id       = sessionId;
        this.userId   = userId;
        this.userRole = userRole;
    };

    this.destroy = function() {
        this.id       = null;
        this.userId   = null;
        this.userRole = null;
    };
});

module.exports = app;