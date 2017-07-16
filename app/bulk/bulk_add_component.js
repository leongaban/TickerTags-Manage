////////////////////////////////////////////////////////////////////////////////
/**
 * @name bulkAddComponent
 * @namespace Directives
 * @desc Directive for the Tickers View
 */

var bulkAddComponent = angular
    .module('bulkAddComponent', [])
    .controller('BulkAddCtrl', BulkAddCtrl)
    .component('bulkAdd', {
        templateUrl  : 'bulk/view/bulk_add.html',
        controller   : BulkAddCtrl,
        controllerAs : 'bk',
        transclude   : true,
        bindings     : {}
    });

BulkAddCtrl.$inject = [
    '$scope',
    '$uibModal',
    'ApiFactory'];

function BulkAddCtrl(
    $scope,
    $uibModal,
    ApiFactory) {

    // Variables ///////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;
    const vm = this;
          vm.category = 'brand';
          vm.bulkTickers = [];
          vm.bulkTickersLoaded = false;
          vm.event = false;
          vm.priority = false;

    // Function expressions ////////////////////////////////////////////////////
    this.bulkAddTickerSearch = () => {
        this.chooseTickersCtrl.tickerTyping(vm.searchTickersInput);
    };

    const errorChecks = () => {
        if (vm.ticker_tags === '' || vm.ticker_tags === undefined) {
            return true;
        } else if (vm.bulkTickers.length === 0) {
            return true;
        } else {
            return false;
        }
    };

    const displayErrors = () => {
        if (vm.ticker_tags === '' || vm.ticker_tags === undefined) {
            $scope.$emit("display.notification", 'Please type tags in text box', 'failure', 4000);
        } else if (vm.bulkTickers.length === 0) {
            $scope.$emit("display.notification", 'Please select ticker(s)', 'failure', 4000);
        }
    };

    const submitTags = () => {
        const ticker_tags = vm.ticker_tags.split('\n');

        return ApiFactory.bulkaddRequest(R.map(R.prop('ticker'), vm.bulkTickers), ticker_tags, vm.category, vm.event, vm.priority).then((data) => {
            $scope.$emit("display.notification", 'Tags added!', 'success', 4000);
        }).catch(apiError);
    };

    const bulkaddSubmit = () => {
        return errorChecks() ? displayErrors() : submitTags();
    };

    const removeTicker = (ticker) => {
        for (let i=0; i<vm.bulkTickers.length; i++) {
            if (vm.bulkTickers[i] === ticker) {
                vm.bulkTickers.splice(i, 1);
            }
        }
    };

    this.register = (child) => this.chooseTickersCtrl = child;

    this.selectTicker = (ticker) => {
        this.bulkTickers.push(ticker);
    };

    this.$onInit = () => {
        // console.log('bulkAddComponent');
    };

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.bulkaddSubmit = bulkaddSubmit;
    vm.removeTicker  = removeTicker;

    // Events //////////////////////////////////////////////////////////////////
    $scope.$on("chosen.ticker.selected", function(event, ticker) {
        vm.bulkTickers.push(ticker.ticker);
        if (vm.bulkTickers.length > 0) { vm.bulkTickersLoaded = true; }
        $scope.$emit('close.choose.tickerlist');
    });
}

module.exports = bulkAddComponent;