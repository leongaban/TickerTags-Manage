////////////////////////////////////////////////////////////////////////////////
/**
 * @name tagsDirective
 * @namespace Directive
 * @desc Element directive and Controller for the Tags View
 */

const tagsComponent = angular
    .module('tagsModule', ['cgBusy']).value('cgBusyDefaults', {
        message: 'Loading...',
        templateUrl: 'tags/view/busy.html'
    })
    .component('tags', {
        templateUrl  : "tags/view/tags_view.html",
        controller   : TagsCtrl,
        controllerAs : "tgs",
        transclude   : true,
        bindings     : {}
    });

TagsCtrl.$inject = [
    '$location',
    '$rootScope',
    '$scope',
    '$state',
    'ApiFactory',
    'TagsFactory',
    'TickerDetailsFactory',
    'Util'];

function TagsCtrl (
    $location,
    $rootScope,
    $scope,
    $state,
    ApiFactory,
    TagsFactory,
    TickerDetailsFactory,
    Util) {

    // Variables ///////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;
    const notUndefined = R.compose(R.not, R.isNil);
    const vm = this;
    vm.predicate         = 'added_epoch';
    vm.urlTicker         = '';
    vm.tagSearching      = '';
    vm.newTerm           = '';
    vm.tableType         = 'all';
    vm.ticker            = {};
    vm.tags              = [];
    vm.container         = {};
    vm.reportedTotal     = 0;
    vm.addedUsername     = true;
    vm.event             = false;
    vm.priority          = false;
    vm.reverse           = false;
    vm.loading           = false;
    vm.noCheck           = true;
    vm.showingAllTags    = true;
    vm.percent           = true;
    vm.allReported       = false;
    vm.hasReports        = false;
    vm.showingTickerList = false;

    vm.totals = {
        all: 0,
        reports: 0,
        event: 0,
        priority: 0,
        deleted: 0
    };

    // Function expressions ////////////////////////////////////////////////////
    const toggleTables = (tab) => {
        vm.tableType = tab;
        vm.showingAllTags = tab === 'all';
        TagsFactory.table(tab);

        switch (tab) {
            case 'all'      : vm.addedUsername = true;  vm.tags = vm.container.all;      break;
            case 'search'   : vm.addedUsername = true;  vm.tags = vm.container.all;      break;
            case 'reports'  : vm.addedUsername = false; vm.tags = vm.container.reports;  break;
            case 'event'    : vm.addedUsername = true;  vm.tags = vm.container.event;    break;
            case 'priority' : vm.addedUsername = true;  vm.tags = vm.container.priority; break;
            case 'deleted'  : vm.addedUsername = false; vm.tags = vm.container.deleted;  break;
        }
    };

    const setupOrderByVol = () => {
        vm.predicate = 'week_quantity';
        vm.reverse   = !vm.reverse;
    };

    const setupOrderDate = () => $rootScope.$emit("tags.table.order.date");

    const tagEdited = (newTerm, oldTerm, action) => TagsFactory.updateTag(newTerm, oldTerm, action);

    const removeTag = (tag) => {
        const currentTags = vm.tags;
        vm.tags = R.reject(propTerm(tag.term), currentTags);
    };

    const closeTickersSearch = () => {
        vm.showingTickerList = false;
        $scope.$emit("close.choose.tickerlist");
    };

    const createEventParams = (type) => {
        const params = { active: 1 };
        params[type] = 1;
        return params;
    };

    const createDeletedParams = () => {
        return {
            active : 0,
            removed_by_user : 1,
            search : '',
            todo : '',
            tag : ''
        };
    };

    const getTags = (ticker, type, params = null) => {
        if (type === 'event' || type === 'priority') {
            params = createEventParams(type);
        }
        else if (type === 'deleted') {
            params = createDeletedParams();
        }
        return TagsFactory.getTags(type, ticker, params);
    };

    const getReportedTags = (ticker, refreshed) => {
        TagsFactory.getReportedTags(vm.allReported, ticker, refreshed).then(reportedTerms => {
            vm.totals.reports = reportedTerms.total;
            if (refreshed) { vm.tags = vm.container.reports = reportedTerms.terms; }
            if (reportedTerms.total > 0) {
                vm.container.reports = reportedTerms.terms;
                vm.hasReports = true;
            } else if (reportedTerms.total === 0) {
                vm.hasReports = false;
            }
        });
    };

    const requestAllTags = () => {
        const safeTicker = Util.replaceSlash($state.params.ticker);
        // console.log('requestAllTags', safeTicker);

        return TickerDetailsFactory.getDetails(safeTicker).then((fullTicker) => {
            vm.ticker = fullTicker;

            getTags(safeTicker, 'all').then((allTags) => {
                vm.totals.all = allTags.total;
                vm.tags = vm.container.all = allTags.terms;
                vm.loading = true;
                setupOrderDate();
            });

            getReportedTags(safeTicker);

            getTags(safeTicker, 'event').then((eventTags) => {
                vm.totals.event    = eventTags.total;
                vm.container.event = eventTags.terms;
            });

            getTags(safeTicker, 'priority').then((priorityTags) => {
                vm.totals.priority    = priorityTags.total;
                vm.container.priority = priorityTags.terms;
            });

            getTags(safeTicker, 'deleted').then((deletedTags) => {
                vm.totals.deleted    = deletedTags.total;
                vm.container.deleted = deletedTags.terms;
            });

            return 'Loaded TagsView';
        });
    };

    const propTerm = R.propEq('term');

    const refreshReportedTags = (tag) => {
        vm.container.reports.terms = R.reject(propTerm(tag.term), vm.container.reports.terms);
    };

    const updateForSingleTicker = (tag, type) => {
        // console.log('updateForSingleTicker', tag);
        return ApiFactory.updateTerm(1, tag.term_id, tag, tag.ticker, tag.term, tag.event, tag.priority).then(() => {
            const currentNumber = R.prop(type, vm.totals)
            const status = R.prop(type, tag);
            const operation = status ? R.add(1) : R.subtract(R.__, 1);
            const updatedTotal = R.assoc(type, operation(currentNumber), vm.totals);
            vm.totals = updatedTotal;
            vm.container[type] = status ? R.insert(0, tag, vm.container[type]) : R.reject(propTerm(tag.term), vm.container[type]);
            toggleTables(vm.tableType);
            return tag;
        });
    };

    const truthy = (tag) => {
        tag.event    = !!tag.event;
        tag.priority = !!tag.priority;
        return tag;
    };

    this.editTag = (tag) => {
        const updatedTag = R.clone(tag);
        const id = tag.term_id ? tag.term_id : tag.id;

        ApiFactory.getTagDataSilm(id).then((ticker_tag) => {
            updatedTag.tickers = R.filter(Util.returnIfSomething, ticker_tag.tickers);
            $scope.$emit("display.modal.edittag", updatedTag); // Modal
            $scope.$emit("modal.open"); // Overlay
        });
    };

    this.updateTag = (tag, type) => {
        return tag.ticker ? updateForSingleTicker(tag, type) : TagsFactory.updateForMultipleTickers(tag, type).then((tags) => {
            const tagsState = vm.tags;
            vm.tags = R.map(truthy, tagsState);
            return tags;
        });
    };

    this.changeEventPriority = (tag) => {
        const event    = tag.event;
        const priority = tag.priority;

        ApiFactory.updateTerm(1, tag.term_id, tag, vm.ticker, tag.term, tag.event, tag.priority).then((res) => {
            if (event)    tag.event    = true;
            if (priority) tag.priority = true;
            $scope.$emit("display.notification", 'Tags status updated!', 'success', 2000);
        });
    };

    this.approveReport = (tag) => TagsFactory.approveTag(tag, 'tagsView').then(refreshReportedTags);
    this.denyReport    = (tag) => TagsFactory.denyTag(tag).then(refreshReportedTags);

    const loadSearch = (searchedTerm) => {
        return TagsFactory.getSearchedTags($state.params.term).then((searchedTags)=>{
            if (searchedTags) {
                vm.totals.all = searchedTags.total;
                vm.tags = vm.container.all = searchedTags.terms;
                vm.loading = true;
            }
            return vm.tags;
        });
    };

    this.delete = (tag) => {
        TagsFactory.rowDelete(tag).then((res) => {
            const updatedList = R.reject(R.propEq('term_id', res.data.ticker_term.term_id), vm.container.all);
            vm.tags = vm.container.all = updatedList;
        });
    };

    this.reload = (tags, table) => {
        return $state.params.search ? loadSearch() : getTags(vm.ticker.ticker, table, null, true).then((tags) => {
            vm.totals[table] = tags.total;
            vm.tags = vm.container[table] = tags.terms;
            return 'Re-Loaded Tags';
        });
    };

    this.$onInit = () => {
        if ($state.params.search) {
            this.searchState = true;
        }
        else if ($location.$$search.term) {
            this.searchState = $state.params.search = true;
        }
        else {
            this.searchState = false;
        }

        this.searchedTag = $state.params.term;
        this.searchState ? loadSearch(this.searchedTag) : requestAllTags();
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on("load.tags", () => requestAllTags());

    $rootScope.$on("tag.edited", (event, newTag, oldTag, action) => tagEdited(newTag, oldTag, action));

    $rootScope.$on("tag.deleted", (event, tag) => removeTag(tag));

    $rootScope.$on("update.category", (event, tag) => changeCategory(tag));

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.toggle = toggleTables;
}

module.exports = tagsComponent;