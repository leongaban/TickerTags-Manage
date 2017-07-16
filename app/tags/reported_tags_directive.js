////////////////////////////////////////////////////////////////////////////////
/**
 * @name reportedTagsDirective
 * @namespace Directive
 * @desc Element directive and Controller for the Tags View
 */

var reportedTagsDirective = angular
    .module('tags_module', [])
    .directive('reportedTags', reportedTagsDirective)
    .filter("fromTimestamp", function() {
        return function(timestamp, format) {
            return moment.unix(timestamp).format(format);
        }
    });

function reportedTagsDirective() {
    return {
        templateUrl      : "tags/view/reported_tags.html",
        restrict         : 'E',
        replace          : true,
        bindToController : true,
        controller       : ReportedTagsCtrl,
        controllerAs     : 'reps',
        scope            : {}
    };
}

ReportedTagsCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$timeout',
    'AuthFactory',
    'TagsFactory',
    'TickersFactory',
    'UsersFactory',
    'Util'];

function ReportedTagsCtrl (
    $rootScope,
    $scope,
    $timeout,
    AuthFactory,
    TagsFactory,
    TickersFactory,
    UsersFactory,
    Util) {

    // Variables ///////////////////////////////////////////////////////////////
    const vm               = this;
          vm.urlTicker     = '';
          vm.tagSearching  = '';
          vm.newTerm       = '';
          vm.ticker        = {};
          vm.tags          = {};
          vm.terms         = [];
          vm.reportedTotal = 0;
          vm.myTotal       = 0;
          vm.tagsLoaded    = false;
          vm.allReported   = true;
          vm.showChris     = false;
          vm.viewAll       = true;

    let allReports         = [];
    let usersTickerReports = [];

    // Function expressions ////////////////////////////////////////////////////
    const toggleTables = (tableType) => {
        if (tableType === 'all') {
            vm.viewAll = true;
            vm.terms   = allReports;
        } else {
            vm.viewAll = false;
            vm.terms   = usersTickerReports;
        }
    };

    const massCategory = () => TagsFactory.massChangeCategory();

    const changeCategory = (tag) => TagsFactory.changeCategory(tag, tag.ticker);

    const reportApprove = (report) => TagsFactory.approveTag(report, 'tagReports');

    const reportDeny = (report) => TagsFactory.denyTag(report);

    const displayChris = () => {
        vm.showChris = true;
        $rootScope.$emit("display.notification", 'Clean up these reports! :D', 'success', 3000);
        $timeout(() => { vm.showChris = false; }, 2000);
    };

    const generateMyTickersTable = (myTickers) => {
        // console.log('generateMyTickersTable', myTickers);
        usersTickerReports =  _.intersectionBy(vm.terms, myTickers, 'ticker');
        vm.myTotal = usersTickerReports.length;
    };

    const pullMyTickers = (user) => {
        TickersFactory.getMyTickers(user.id, 0, undefined, 'ticker').then((tickers) => {
            generateMyTickersTable(tickers);
        });
    };

    const lowerCase = (term) => {
        const updatedTerm = term;
        updatedTerm.tag = Util.lowercaseFirstLetter(updatedTerm.tag);
        return updatedTerm;
    };

    const formatCategories = (terms) => R.map(lowerCase, terms);

    const checkLoginPullTickers = () => {
        AuthFactory.check_login().then((user) => {
            pullMyTickers(UsersFactory.storeMe(user));
        });
    };

    const loadReportedTags = () => {
        const myUser = UsersFactory.getMe();
        TagsFactory.getReportedTags(vm.allReported, null, null, 'getReports').then((reports) => {
            allReports = formatCategories(reports.terms);
            vm.reportedTotal = allReports.length;
            vm.tagsLoaded = true;
            toggleTables('all');
            R.isNil(myUser) ? checkLoginPullTickers() : pullMyTickers(myUser);
        });
    };

    ////////////////////////////////////////////////////////////////////////////
    /**
     * Initialization function of the ReportedTags Controller
     * @function
     */
    loadReportedTags();

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on("refresh.reports", () => loadReportedTags());

    // View model //////////////////////////////////////////////////////////////
    vm.loadReportedTags = loadReportedTags,
    vm.toggleTables     = toggleTables,
    vm.changeCategory   = changeCategory,
    vm.reportApprove    = reportApprove,
    vm.reportDeny       = reportDeny,
    vm.displayChris     = displayChris;
}

module.exports = reportedTagsDirective;