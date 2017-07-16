////////////////////////////////////////////////////////////////////////////////
/**
 * @name bulkTermComponent
 * @namespace Directive
 * @desc Element directive and Controller for the Tags View
 */

module.exports = angular
    // .module('tags_module')
    .module('bulk_terms_module', [])
    .component('bulkTermsView', {
        templateUrl: 'tags/bulk/bulk_terms.html',
        restrict: 'E',
        replace: true,
        bindToController: true,
        controller: BulkTermsCtrl,
        controllerAs: 'btc',
        transclude: true,
        bindings: {}
    });

BulkTermsCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$http',
    '$location',
    'ApiFactory',
    'TagsFactory',
    'TickersFactory',
    'Util'];

function BulkTermsCtrl(
    $rootScope,
    $scope,
    $http,
    $location,
    ApiFactory,
    TagsFactory,
    TickersFactory,
    Util) {

    // Variables ///////////////////////////////////////////////////////////////
    const vm = this;
    vm.headerTitle = 'Ticker Bulk Variables';

    vm.new_bulk_term = {
        'ticker': null,
        'sector_id': null,
        'term': ''
    };

    const reset_model = vm.new_bulk_term;

    // Function expressions ////////////////////////////////////////////////////
    const addBulkTerm = (term) => {
        ApiFactory.postBulkTerm(term).then(data => {
            loadBulkTerms();
            $rootScope.$emit('display.notification', `Bulk Add process started for ${term.term}!`, 'success', 4000);
            // Reset model
            vm.new_bulk_term = { 'ticker': null, 'sector_id': null, 'term': '' };
        });
    };

    const removeBulkTerm = (term_id) => ApiFactory.deleteBulkTerm(term_id).then(data => loadBulkTerms());

    const loadBulkTerms = () => {
        ApiFactory.getSectors().then(data => {
            vm.sectors = data.data.sectors;
            const sector_lookup = {};
            for (let i=0; i<vm.sectors.length; i++) {
                sector_lookup[vm.sectors[i].id] = vm.sectors[i].name;
            }
            ApiFactory.getBulkTerms().then(data => {
                vm.bulk_terms = data.data.bulk_terms;
                for (let i=0; i<vm.bulk_terms.length; i++) {
                    if (vm.bulk_terms[i].sector_id) {
                        vm.bulk_terms[i].sector = sector_lookup[vm.bulk_terms[i].sector_id];
                    }
                }
            });
        });
    };

    this.$onInit = () => loadBulkTerms();

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.loadBulkTerms  = loadBulkTerms;
    vm.addBulkTerm    = addBulkTerm;
    vm.removeBulkTerm = removeBulkTerm;
}