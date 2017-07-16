/*global angular*/
////////////////////////////////////////////////////////////////////////////////
/**
 * @name chooseTickerListComponent
 * @namespace Component
 * @desc Controls the Choose Ticker search list popover inside of AddTagModal
 */

const chooseTickerListComponent = angular
    .module('chooseTickerListComponent', [])
    .component('chooseTickerList', {
        templateUrl  : "tickers/view/choose_ticker_list.html",
        controller   : ChooseTickerCtrl,
        controllerAs : "ct",
        transclude   : true,
        bindings     : {
            onSelect: '&',
            onAdd: '&'
        }
    });

ChooseTickerCtrl.$inject = [
    '$rootScope',
    '$scope',
    'ApiFactory',
    'TickersFactory'
];

function ChooseTickerCtrl(
    $rootScope,
    $scope,
    ApiFactory,
    TickersFactory) {

    // Variables ///////////////////////////////////////////////////////////////
    this.tickersList       = [];
    this.onTickers         = false;
    this.addTickersShowing = false;
    this.tickersListLoaded = false;

    // Function expressions ////////////////////////////////////////////////////
    this.$onInit = () => {
        this.onAdd({ child: this });
    };

    this.closeThis = () => {
        this.tickersList       = [];
        this.tickersListLoaded = false;
        this.addTickersShowing = false;
        this.onTickers         = false;
    };

    const closeThis = this.closeThis;

    this.tickerTyping = (word) => {
        this.addTickersShowing = true;

        // Fuzzy search string:
        const load = "?search=" +word+ "&limit=50&start=0";

        // Populate search tickers:
        return ApiFactory.getTickersList(null, load).then((data) => {
            this.tickersList = data.data.tickers;

            if (this.tickersList.length === 0) {
                this.noTickers = true;
            } else if (this.tickersList) {
                this.noTickers = false;
            }

            this.tickersListLoaded = true;
            $scope.$emit('chosen.tickers.loaded');
        });
    };

    this.selectTicker = (ticker) => {
        this.onSelect({ ticker: ticker });
        closeThis();
        // if (this.searchTickers && this.listState != 'fromBulkAdd') {
        //     let url = '#/tags?ticker=' + ticker.ticker;
        //     $window.location.href = url;
        //     location.reload();
        // } else {
        //     $scope.$emit('chosen.ticker.selected', ticker);
        // }
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on("modal.open", (event) => {
        this.addTickersShowing = false;
        this.tickersListLoaded = false;
        this.tickersList       = [];
    });

    $rootScope.$on("close.choose.tickers.x", (event) => { this.onTickers = false; });

    $rootScope.$on("close.choose.tickerlist", (event) => closeThis());
}

module.exports = chooseTickerListComponent;