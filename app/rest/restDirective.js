////////////////////////////////////////////////////////////////////////////////
/**
 * @name restDirective
 * @namespace Directives
 * @desc Directive for the REST API View
 */

var restDirective = angular
    .module('restDirective', [])
    .controller('RestCtrl', RestCtrl)
    .directive('restView', restView);

function restView() {
    var directive = {
        templateUrl      : "rest/rest.html",
        restrict         : "E",
        replace          : true,
        bindToController : true,
        controller       : RestCtrl,
        controllerAs     : '_rest',
        link             : link,
        scope            : {}
    };
    return directive;
    function link(scope, element, attrs) {}
}

RestCtrl.$inject = [
    '$rootScope',
    '$scope',
    'ApiFactory',
    'RestFactory'];

function RestCtrl(
    $rootScope, 
    $scope,
    ApiFactory,
    RestFactory) {

     /** Init restDirective scope */
    /** --------------------------------------------------------------------- */
    var vm           = this;
        vm.getCol    = [],
        vm.postCol   = [],
        vm.putCol    = [],
        vm.deleteCol = [];

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.openModal = openModal;
    ////////////////////////////////////////////////////////////////////////////

    RestFactory.getREST().then(filterColumns, handleError);

    function filterColumns(apis) {
        _.each(apis, function(api) {
            switch (api.method) {
                case 'GET'    : vm.getCol.push(api);    break;
                case 'POST'   : vm.postCol.push(api);   break;
                case 'PUT'    : vm.putCol.push(api);    break;
                case 'DELETE' : vm.deleteCol.push(api); break;
            }
        });
    }

    function openModal(id) {
        $scope.$emit("display.modal.rest", id);
        $scope.$emit("modal.open");
    }

    function handleError(error) {
        console.log('error:',error);
    }
}

module.exports = 'restDirective';