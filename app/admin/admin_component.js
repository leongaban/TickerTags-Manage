////////////////////////////////////////////////////////////////////////////////
/**
 * @name adminComponent
 * @namespace Directives
 * @desc Directive for the Tickers View
 */

module.exports = angular
    .module('admin_module')
    .component('adminView', {
        templateUrl: 'admin/admin.html',
        controller: AdminCtrl,
        controllerAs: '_admin',
        transclude: true,
        bindings: {}
    });

AdminCtrl.$inject = [
    '$rootScope',
    '$scope',
    'ApiFactory'];

function AdminCtrl(
    $rootScope,
    $scope,
    ApiFactory) {

    // Init adminComponent scope ///////////////////////////////////////////////
    const apiError = ApiFactory.apiError;
    ////////////////////////////////////////////////////////////////////////////

    this.postBlog = () => {
        let json = { some: "json" };
        ApiFactory.postBlog(json).then(res => {
            console.log('ApiFactory.postBlog res:',res);
        }).catch(apiError);
    };
}