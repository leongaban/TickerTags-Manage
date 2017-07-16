////////////////////////////////////////////////////////////////////////////////
/**
 * @name tickersDirective
 * @namespace Directives
 * @desc Directive for the Tickers View
 */

var tickersDirective = angular
    .module('tickersDirective', [])
    .controller('TickersCtrl', TickersCtrl)
    .directive('tickersView', tickersView);

function tickersView() {
    return {
        templateUrl      : "tickers/view/tickers.html",
        restrict         : "E",
        replace          : true,
        bindToController : true,
        controller       : TickersCtrl,
        controllerAs     : 'tkrs',
        scope            : {}
    };
}

TickersCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$state',
    '$q',
    '$location',
    'ApiFactory',
    'AuthFactory',
    'TickersFactory',
    'TagsFactory'];

function TickersCtrl(
    $rootScope,
    $scope,
    $state,
    $q,
    $location,
    ApiFactory,
    AuthFactory,
    TickersFactory,
    TagsFactory) {

    // Variables ///////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;
    const vm = this;
    const milliseconds = (new Date).getTime();
    
    vm.user              = {};
    vm.reports           = {};
    vm.reviewTickers     = [];
    vm.showingAllTickers = false;
    vm.tableLoaded       = false;

    vm.myTickers = {
        type          : 'mine',
        tickers       : [],
        service_start : 0,
        service_order : 'ticker',
        total         : 0,
        date          : milliseconds
    };

    // Function Expressions ////////////////////////////////////////////////////
    const selectTicker = (ticker) => {
        TickersFactory.storeTicker(ticker);
        $state.go('tags', { search: false, ticker: ticker });
        // window.open('#/tags', '_self');
    };

    const reviewTicker = (type, ticker) => {
        type === 'approve' ? updateTicker('approve', ticker) : updateTicker('remove', ticker);
    };

    const isMessageApproved = (type) => {
        const isTypeApprove = (type) => type === 'approve';
        const answer = isTypeApprove(type) ? true : false;
        return answer;
    };

    const updateReviewArray = (ticker) => { _.pull(vm.reviewTickers, ticker); };

    const successMsg = (ticker) => {
        updateReviewArray(ticker);
        $rootScope.$emit("display.notification", ticker.ticker+' approved!', 'success', 1000);
    };

    const removedMsg = (ticker) => {
        updateReviewArray(ticker);
        $rootScope.$emit("display.notification", ticker.ticker+' removed!', 'success', 1000);
    };

    const updateTicker = (type, ticker) => {
        const data = {
            'active'   : 0,
            'verified' : 0
        };

        if (type === 'approve') {
            data.verified = 1;
        }
        else if (type === 'remove') {
            data.active   = 0;
            data.verified = 1;
        }

        ApiFactory.updateTicker(ticker.ticker, data).then(() => {
            isMessageApproved(type) ? successMsg(ticker) : removedMsg(ticker);
        }).catch(apiError);
    };

    const removeTicker = (ticker) => {
        // Remove from Tickers
        vm.myTickers.tickers = _.remove(vm.myTickers.tickers, function(myTicker) {
            return myTicker != ticker.ticker;
        });

        // for (var i=0; i<vm.myTickers.tickers.length; i++) {
        //     if (ticker.ticker === vm.myTickers.tickers[i].ticker) {
        //         vm.myTickers.tickers.splice(i,1);
        //     }
        // }

        // Remove from Tickers to review
        vm.reviewTickers = _.remove(vm.reviewTickers, function(reviewTicker) {
            return reviewTicker.ticker != ticker.ticker;
        });
    };

    const whichTable = (bool) => bool;

    const showAll = () => {
        vm.myTickers.type = 'all';
        getAllTickers();
    };

    const showMine = () => {
        vm.myTickers.type = 'mine';
        getMyTickers(vm.user);
    };

    const toggleTables = () => {
        vm.showingAllTickers = !vm.showingAllTickers;
        vm.tableLoaded = false;
        whichTable(vm.showingAllTickers) ? showAll() : showMine();
    };

    const findReportedTags = (personalTickers) => {
        ApiFactory.getReportedTerms(true).then((tag_reports) => {
            const getMatchingTickers = (userTickers, reportedTickers) => {
                const matches = [];

                for (let i=0; i<userTickers.length; i++) {
                    for (let e = 0; e<reportedTickers.length; e++) {
                        if (userTickers[i].ticker === reportedTickers[e].ticker) matches.push(userTickers[i].ticker);
                    }
                }

                return matches;
            };

            const getReportedCounts = (arr) => {
                const _count = _.countBy(arr, (tickersObject) => tickersObject);
                vm.reports = _count;
                return _count;
            };

            getReportedCounts(getMatchingTickers(personalTickers, tag_reports));
        });
    };

    const loadNewTickers = () => {
        ApiFactory.getTickers(undefined, 1, 0, 0).then((tickers) => {
            vm.reviewTickers = tickers;
        });
    };

    const exportCSV = (ticker) => {
        const deferred = $q.defer();
        const array = [];

        ApiFactory.retrieveAllTerms(ticker).then((data) => {
            for (let i=0; i<data.ticker_tags.length; i++) {
                let term_object = data.ticker_tags[i];
                array.push([term_object.term, term_object.tag]);
            }
            deferred.resolve(array);
        });
        return deferred.promise;
    }

    const errorGotoLogin = () => {
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        $location.path('/login');
    };

    const createUserObject = (tikObj) => {
        return { id: tikObj.user_id, username: tikObj.username };
    };

    const openUserModal = (tickerObject) => {
        const miniUser = createUserObject(tickerObject);
        $scope.$emit("display.modal.user", miniUser, 'edit', 'tickersView');
        $scope.$emit("modal.open");
    };

    const loadTickers = (params) => {
        TickersFactory.getMyTickers(params.id, vm.myTickers.service_start, undefined, undefined, vm.myTickers.service_order)
            .then((tickers) => {
                if (!vm.showingAllTickers) findReportedTags(tickers);
                vm.myTickers.tickers = tickers;
                // console.log('vm.myTickers.tickers',vm.myTickers.tickers);
                vm.myTickers.total = tickers.length;
                vm.tableLoaded = true;
            });
    };

    const resetTickers = () => {
        vm.myTickers.tickers = [];
        vm.myTickers.service_start = 0;
        vm.myTickers.service_order = undefined;
        vm.myTickers.total = 0;
    };

    const getMyTickers = (user) => {
        vm.myTickers.service_user_id = user.id;
        resetTickers();
        loadTickers(user);
    };

    const getAllTickers = () => {
        vm.tableLoaded = false;
        vm.myTickers.service_user_id = undefined;
        resetTickers();
        loadTickers(vm.myTickers);
    };

    ////////////////////////////////////////////////////////////////////////////
    /**
     * Initialization function of the TickersDirective Controller
     * @function
     */
    AuthFactory.check_login().then((user) => {
        user.role === 'Curator' ? $rootScope.isCurator = true : $rootScope.isCurator = false;
        $rootScope.currentUser = user;
        $rootScope.username = user.username;

        vm.myTickers.service_user_id = user.id;
        vm.user = user;

        loadTickers(vm.user); // Load My Tickers
        loadNewTickers(); // Load New Tickers to approve
    }).catch(errorGotoLogin);

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on("ticker.removed", (event, symbol) => removeTicker({ ticker: symbol }));

    $rootScope.$on("ticker.get.all", (event) => getAllTickers());

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.selectTicker  = selectTicker;
    vm.reviewTicker  = reviewTicker;
    vm.removeTicker  = removeTicker;
    vm.toggleTables  = toggleTables;
    vm.getMyTickers  = getMyTickers;
    vm.getAllTickers = getAllTickers;
    vm.resetTickers  = resetTickers;
    vm.loadTickers   = loadTickers;
    vm.exportCSV     = exportCSV;
    vm.openUserModal = openUserModal;
}

module.exports = tickersDirective;