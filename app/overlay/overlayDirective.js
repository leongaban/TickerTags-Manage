/*global angular*/
////////////////////////////////////////////////////////////////////////////////
/**
 * @name overlayDirective 
 * @namespace Directive
 * @desc Controls the Add Ticker Modal
 */

var overlayDirective = angular
    .module('overlayDirective', [])
    .directive('overlay', overlay);

function overlay() {
    var directive = {
        templateUrl      : "overlay/overlay.html",
        restrict         : 'E',
        replace          : true,
        bindToController : true,
        controller       : OverlayCtrl,
        controllerAs     : 'o',
        link             : link,
        scope            : {}
    };
    return directive;
    function link(scope, element, attrs) {}
}

OverlayCtrl.$inject = [
    '$rootScope',
    '$scope'];

function OverlayCtrl (
    $rootScope,
    $scope) {

    var vs = $scope;
        vs.overlayShow = false;

    /** Hoisted functions */
    /** --------------------------------------------------------------------- */
    vs.overlayClicked = overlayClicked;
    ////////////////////////////////////////////////////////////////////////////

    $rootScope.$on("modal.open", function(event) {
        vs.overlayShow = true;
    });

    $rootScope.$on("close.overlay", function(event) {
        vs.overlayShow = false;
    });

    function overlayClicked() {
        $scope.$emit("close.modal");
        vs.overlayShow = false;
    }
}

module.exports = overlayDirective;