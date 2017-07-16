////////////////////////////////////////////////////////////////////////////////
/**
 * @name restModalDirective
 * @namespace Directives
 * @desc Directive for the Main Nav
 */

var restModalDirective = angular
    .module('restModalDirective', [])
    .controller('RestModalCtrl', RestModalCtrl)
    .directive('restModal', restModal);

function restModal() {
    var directive = {
        templateUrl      : "rest/rest_modal.html",
        restrict         : "E",
        replace          : true,
        bindToController : true,
        controller       : 'RestModalCtrl as rest_modal',
        link             : link,
        scope            : false
    };
    return directive;
    function link(scope, element, attrs) {}
}

RestModalCtrl.$inject = [
    '$rootScope',
    '$scope',
    'ApiFactory',
    'RestFactory'];

function RestModalCtrl(
    $rootScope,
    $scope,
    ApiFactory,
    RestFactory) {

    /** Init restModalDirective scope */
    /** --------------------------------------------------------------------- */
    var vm      = this;
        vm.show = false;

        vm.api = {
            method         : '',
            resource       : '',
            description    : '',
            example_input  : '',
            example_output : ''
        }

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.closeModal = closeModal;
    ////////////////////////////////////////////////////////////////////////////

    $scope.$on("display.modal.rest", function(event, api) {
        showModal(api);
    });

    $scope.$on("close.modal", function(event) {
        closeModal();
    });

    function isEmpty(x) {
        return x !== '';
    }

    function showModal(api) {
        vm.show = true;
        vm.api  = api;
    }

    function closeModal() {
        if (vm.show) {
            vm.show = false;
            resetInputs();
            $rootScope.$emit("close.overlay");
        }
    }

    function resetInputs() {
        $scope.$emit("close.choose.tickerlist");
    }
}

module.exports = restModalDirective;