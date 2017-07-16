/*global angular*/
////////////////////////////////////////////////////////////////////////////////
/**
 * @name massActionsModalDirective
 * @namespace Directives
 * @desc Directive for the Main Nav
 */

var massActionsModalDirective = angular
    .module('massActionsModalDirective', [])
    .directive('massActionsModal', massActionsModal);

function massActionsModal() {
    var directive = {
        templateUrl      : "tags/view/mass_actions_modal.html",
        restrict         : "E",
        replace          : true,
        bindToController : true,
        controller       : MassActionsModalCtrl,
        controllerAs     : 'mass_actions',
        link             : link,
        scope            : {}
    };
    return directive;
    function link(scope, element, attrs) {}
}

MassActionsModalCtrl.$inject = [
    '$rootScope',
    '$scope'];

function MassActionsModalCtrl(
    $rootScope,
    $scope) {

    /** Init massActionsModalDirective scope */
    /** --------------------------------------------------------------------- */
    var vm      = this;
        vm.show = false;
        
    // Hoisted functions ///////////////////////////////////////////////////////
    vm.closeModal = closeModal;
    ////////////////////////////////////////////////////////////////////////////

    $rootScope.$on("display.modal.massactions", function(event, type) {
        showModal(type);
    });

    $rootScope.$on("close.modal", function(event) {
        closeModal();
    });

    function showModal(type) {
        vm.type = type,
        vm.show = true;
    }

    function closeModal() {
        if (vm.show) {
            vm.type = '',
            vm.show = false;
            $rootScope.$emit("close.overlay");
        }
    }
}

module.exports = massActionsModalDirective;