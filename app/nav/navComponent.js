////////////////////////////////////////////////////////////////////////////////
/**
 * @name navComponent
 * @namespace Directives
 * @desc Directive for the Main Nav
 */

var navComponent = angular
    .module('navComponent', [])
    .component('navMenu', {
        templateUrl  : "nav/nav.html",
        controller   : NavCtrl,
        controllerAs : "nav",
        transclude   : true,
        bindings     : {}
    });

NavCtrl.$inject = [
    '$window',
    '$location',
    '$rootScope',
    '$scope',
    '$state',
    '$uibModal',
    'ApiFactory',
    'AuthFactory',
    'UsersFactory',
    'ReportedTagsFactory'];

function NavCtrl(
    $window,
    $location,
    $rootScope,
    $scope,
    $state,
    $uibModal,
    ApiFactory,
    AuthFactory,
    UsersFactory,
    ReportedTagsFactory) {

    // Variables ///////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;
    this.showReported  = false;
    this.reportedTotal = 0;
    this.username      = '';

    const hellos = [
        'Welcome back',
        'Hi Brohim / Borsis',
        '欢迎',
        'Willkommen',
        'Hello',
        'Clean them reports',
        'Bienvenue',
        'Make America Great Again!',
        'Sup'
    ];
    
    // Function Expressions ////////////////////////////////////////////////////
    this.$onInit = () => {
        AuthFactory.check_login().then((user) => {
            UsersFactory.storeMe(user);
            this.hello = hellos[Math.floor(Math.random()*hellos.length)];
            this.username = user.username;
        });

        ReportedTagsFactory.getTagsReportedTotal().then(() => {
            this.reportedTotal = ReportedTagsFactory.retrieveReportedTotal();
            this.showReported = this.reportedTotal > 0 ? true : false;
        });
    };

    this.searchForTicker = (ticker) => {
        // $state.go('tags', { ticker: ticker });
        // $window.location.href = '#/tags?ticker='+ticker;
        if ($window.location.hash != '#/tickers') {
            $window.location.href = '#/tags?ticker='+ticker;
            location.reload();
        }
        else {
            $state.go('tags', { ticker: ticker });
        }
    };
    
    this.searchTags = () => {
        $state.go('tags', { search: true, ticker: null, term: this.searchedTag });
    };

    this.openAddTickerModal = () => {
        // $rootScope.$emit("display.modal.addtickers");
        // $scope.$emit("modal.open");
        const addTickerModal = $uibModal.open({
            controllerAs: 'atkm',
            bindToController: true,
            templateUrl: 'tickers/view/add_ticker_modal.html',
            resolve: {},
            controller: function() {
                this.theAdmins = [];

                const createErrorMsg = (type) => {
                    switch(type) {
                        case 'adding'   : return 'Please fill out all fields.'; break;
                        case 'removing' : return 'Please select a ticker to remove.'; break;
                        case 'transfer' : return 'Please select tickers to start transfer.'; break;
                    }
                };

                const displayBlankError = (type) => {
                    $rootScope.$emit("display.notification", createErrorMsg(type), 'failure', 4000);
                    this.$close();
                };

                const addTicker = (ticker, company, admin) => {
                    return ApiFactory.addTicker(ticker, company, admin).then(() => {
                        $rootScope.$emit("display.notification", ticker+' added!', 'success', 4000);
                    }).catch(apiError);
                };

                const filterAdmins = (userList) => _.filter(userList, (user) => user.role === 'Admin');

                this.hideAdminList = () => this.showAdminList = false;
                const hideAdminList = this.hideAdminList;

                this.pullUsersFindAdmins = () => {
                    UsersFactory.initUsersDirect('start=0&limit=10000').then((userData) => {
                        this.theAdmins = filterAdmins(userData.list);
                    });
                };

                this.displayAdminsList = () => {
                    if (this.theAdmins.length > 0) this.showAdminList = true;
                };

                this.selectAdmin = (admin) => {
                    this.newTicker.admin = admin.firstname+' '+admin.lastname;
                    hideAdminList();
                };

                const activateTicker = (ticker) => {
                    return ApiFactory.updateTicker(ticker, { 'active': 1 }).then(() => {
                        $rootScope.$emit("display.notification", ticker+' activated!', 'success', 4000);
                    }).catch(apiError);
                };

                const postNewTicker = (ticker, company, admin) => {
                    return ApiFactory.getTicker(ticker, 0).then((tickers) => {
                        return tickers.length > 0 ? activateTicker(ticker) : addTicker(ticker, company, admin);
                    }).catch(apiError);
                };

                const validateAddTicker = (ticker, company, admin) => {
                    if      (ticker  === '' || ticker  === undefined) { return true; }
                    else if (company === '' || company === undefined) { return true; }
                    else if (admin   === '' || admin   === undefined) { return true; }
                    else    { return false; }
                };

                this.submitNewTicker = (ticker, company, admin) => {
                    return validateAddTicker(ticker, company, admin)
                        ? displayBlankError('adding')
                        : postNewTicker(ticker, company, admin).then((res) => this.$close());
                };

                this.returnTickersToRemove = (ticker) => {
                    const load = "?search=" +ticker+ "&limit=50&start=0";
                    return ApiFactory.getTickersList(null, load).then((data) => {
                        this.searchedTickers = data.data.tickers;
                        this.tickersListLoaded = true;
                        return this.searchedTickers;
                    });
                };

                this.sendToRemoveInput = (ticker) => {
                    this.searchedTickers   = [];
                    this.tickersListLoaded = false;
                    this.tickerToRemove    = ticker;
                };

                const deleteTicker = (ticker) => {
                    return ApiFactory.updateTicker(ticker, { 'active': 0, 'verified': 1 }).then(() => {
                        $rootScope.$emit("display.notification", ticker+' removed!', 'success', 4000);
                        $rootScope.$emit("ticker.removed", ticker);
                    }).catch(apiError);
                };

                this.removeTicker = (ticker) => {
                    ticker === '' || ticker === undefined ? displayBlankError('removing') : deleteTicker(ticker).then((res) => this.$close());
                };

                const processTransfer = (tickerFrom, tickerTo) => {
                    return ApiFactory.updateTicker(tickerFrom, { 'new_ticker': tickerTo }).then(() => {
                        $rootScope.$emit("display.notification", 'Tags transferred from '+tickerFrom+' to '+tickerTo, 'success', 4000);
                    }).catch(apiError);
                };

                this.transferTickers = (tickerFrom, tickerTo) => {
                    tickerFrom && tickerTo != '' ? processTransfer(tickerFrom, tickerTo).then((Res) => this.$close()) : displayBlankError('transfer');
                };

                this.closeFuzzySearch = () => {
                    this.tickersListLoaded = false;
                    this.searchedTickers   = [];
                    this.tickerToRemove    = '';
                };
            }
        });

        addTickerModal.closed.then((res) => {});
        addTickerModal.result.then(() => {});
    };

    this.logout = () => {
        AuthFactory.webservice_logout().then(() => $location.path('/login'));
    };
}

module.exports = navComponent;