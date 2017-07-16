////////////////////////////////////////////////////////////////////////////////
/**
 * @name indexController
 * @namespace Controller
 * @desc Controls the Index
 */

var indexController = angular
    .module('indexController', [])
    .controller('IndexCtrl', IndexCtrl);

IndexCtrl.$inject = [
    '$rootScope',
    '$scope'];

function IndexCtrl(
    $rootScope,
    $scope) {

    /** Init IndexCtrl scope */
    /** --------------------------------------------------------------------- */
    var vm       = this;
        vm.fixed = false;

    /** Hoisted functions */
    /** --------------------------------------------------------------------- */
    ////////////////////////////////////////////////////////////////////////////
    $scope.$on("modal.open", function(event) {
        vm.fixed = true;
    });

    $rootScope.$on("close.overlay", function(event) {
        vm.fixed = false;
    });
}

module.exports = indexController;