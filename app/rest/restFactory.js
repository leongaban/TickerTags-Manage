////////////////////////////////////////////////////////////////////////////////
/**
 * @name RestFactory
 * @namespace Factories
 * @desc Service to GET and handle Users
 */

var restFactory = angular
    .module('restFactory', [])
    .factory('RestFactory', factory);

factory.$inject = ['ApiFactory'];
function factory(ApiFactory) {

    /** RestFactory scope */
    /** --------------------------------------------------------------------- */
    var vm = {};
    var restFactory = {
        getREST    : getREST,
        returnREST : returnREST
    }

    return restFactory;
    ////////////////////////////////////////////////////////////////////////////

    function getREST() {
        return ApiFactory.getRestMethods().then(function(data) {
            vm.restMethods = data.rest_methods;
            return vm.restMethods;
        }, function(error) {
            console.log('error:',error);
        });
    }

    function returnREST() {
        return vm.restMethods;
    }
}

module.exports = restFactory;