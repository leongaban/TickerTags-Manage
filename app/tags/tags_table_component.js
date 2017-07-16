////////////////////////////////////////////////////////////////////////////////
/**
 * @name tagTableComponent
 * @namespace Component
 * @desc Element Commponent and Controller for the TagsTable in TagsView
 */

const tagsTable = angular
    .module('tagsModule')
    .component('tagsTable', {
        templateUrl  : "tags/view/tags_table.html",
        controller   : TagsTableCtrl,
        controllerAs : "tb",
        bindings: {
            tags: '<',
            ticker: '<',
            table: '<',
            loading: '<',
            onUpdate: '&',
            onApprove: '&',
            onDeny: '&',
            onDelete: '&',
            onReload: '&'
        }
    })
    .filter("fromTimestamp", () => {
        return (timestamp, format) => moment.unix(timestamp).format(format);
    });

TagsTableCtrl.$inject = [
    '$q',
    '$rootScope',
    '$sce',
    '$state',
    '$scope',
    '$uibModal',
    'ApiFactory',
    'TagsFactory',
    'TickersFactory'
];

function TagsTableCtrl(
    $q,
    $rootScope,
    $sce,
    $state,
    $scope,
    $uibModal,
    ApiFactory,
    TagsFactory,
    TickersFactory) {

    const reload = this.onReload;
    const checkTrue = R.propEq('checked', true);
    let isSearch = !!$state.params.search;
    this.noCheck = true;
    this.reverse = false;
    this.predicate = 'added_epoch';

    ////////////////////////////////////////////////////////////////////////////
    this.setupOrderDate = () => {
        this.predicate = 'added_epoch';
        this.reverse=!this.reverse;
    };

    const setupOrderDate = this.setupOrderDate;

    const pluckTicker  = (ticker) => ticker.ticker;
    const pluckChecked = (tickers) => R.map(pluckTicker, TagsFactory.getChecked(tickers));

    const processTag = (tag, tickers, oldTerm) =>  {
        const promises = tickers.map((ticker) => ApiFactory.updateTerm(0, tag.term_id, tag, ticker, oldTerm).then(() => {
            return ApiFactory.saveTerm(tag.term, tag.tag, ticker).then((res) => {
                tag.id = res.data.ticker_tag.term_id;
                return res.data.ticker_tag;
            });
        }));
        return $q.all(promises);
    };

    this.changeCategory = (tag) => {
        if (!$state.params.search) TagsFactory.changeCategory(tag, TickersFactory.getEscapedTicker());
    };

    const changeCategory = this.changeCategory;

    const objectify = R.map(TickersFactory.objectifyTicker);

    this.editTag = (tag) => {
        const tickersPromise = R.isNil(tag.ticker) ? Promise.resolve(tag.tickers) : ApiFactory.getTagDataSilm(tag.term_id).then((ticker_tag) => {
            return ticker_tag.tickers;
        });
        const newsPromise   = ApiFactory.getNews(tag.ticker, tag.term_id);
        const tweetsPromise = ApiFactory.getTweets(tag.term_id);

        const formatSocialData = (data) => {
            const lens = R.lens(R.prop('highlight'), R.assoc('highlight'));
            return R.over(lens, $sce.trustAsHtml, data);
        };

        const checkIt = R.curry((bool, ticker) => {
            ticker.checked = bool;
            return ticker;
        });

        const checkAll = (bool, tickers) => R.map(checkIt(bool), tickers);

        const editModal = $uibModal.open({
            controllerAs: 'etm',
            bindToController: true,
            templateUrl: 'tags/view/edit_tag_modal.html',
            windowClass: 'tags-modal',
            resolve: {
                tag: () => tag
            },
            controller: function(tag) {
                this.tag = tag;

                tickersPromise.then((tickers) => {
                    this.tickers = objectify(tickers);
                });

                this.tagStatus = 'Updating';
                this.saving = false;
                this.canSave = false;
                this.canDelete = false;
                this.anyTicker = false;
                this.termChanged = false;
                this.categoryChanged = false;
                this.allTickers = false;
                this.wtf = tweetsPromise;
                this.noNews = '';
                this.newsPromise = newsPromise;
                this.tweetsPromise = tweetsPromise;

                newsPromise.then((res)   => {
                    return res.data.articles_rows ? R.map(formatSocialData, res.data.articles) : 'No news';
                }).then((news) => {
                    const setNews = () => this.news = news;
                    const noNews  = () => this.noNews = news;
                    news === 'No news' ? noNews() : setNews();
                });

                tweetsPromise.then((res) => {
                    return res.data.tweets_rows ? R.map(formatSocialData, res.data.tweets) : 'No tweets';
                }).then((tweets) => {
                    const setTweets = () => this.tweets = tweets;
                    const noTweets  = () => this.noTweets = tweets;
                    tweets === 'No tweets' ? noTweets() : setTweets();
                });

                const table = TagsFactory.getTable();
                const oldTerm = tag.term;
                const oldCat  = tag.tag;
                const checkCategory = (tag) => tag.tag  !== oldCat;
                const checkTerm     = (tag) => tag.term !== oldTerm;
                const setUserName = (tag, table) => {
                    this.tag.user = table === 'deleted' ? R.prop('added_username', tag) : R.prop('username', tag);
                };

                const checkSaveStatus = () => {
                    const value = this.anyTicker && this.termChanged || this.anyTicker && this.categoryChanged;
                    return value;
                };

                setUserName(tag, table);

                this.checkGlobal = () => {
                    this.tickers   = checkAll(this.allTickers, this.tickers);
                    this.canDelete = this.anyTicker = R.any(checkTrue, this.tickers);
                    this.canSave   = checkSaveStatus();
                };

                this.changeTerm = () => {
                    this.termChanged = checkTerm(this.tag);
                    this.canSave = checkSaveStatus();
                };

                this.changeCategory = () => {
                    this.categoryChanged = checkCategory(this.tag);
                    this.canSave = checkSaveStatus();
                };

                this.checkTicker = () => {
                    this.canDelete = this.anyTicker = R.any(checkTrue, this.tickers);
                    this.canSave   = checkSaveStatus(this.tag);
                };

                this.updateTag = (tag) => {
                    this.tagStatus = 'Updating';
                    this.saving = true;
                    const tickers = pluckChecked(this.tickers);
                    processTag(tag, tickers, oldTerm).then((res) => {
                        const tag = R.head(res);
                        this.saving = false;
                        $scope.$emit("display.notification", tag.term+' edited!.', 'success', 4000);
                        this.$close();
                    });
                };

                this.deleteTag = () => {
                    this.tagStatus = 'Deleting';
                    this.saving = true;
                    tag.tickers = pluckChecked(this.tickers);
                    TagsFactory.massDelete(tag, 'EditTagModal', isSearch).then((res) => {
                        this.tags = res.tags;
                        this.noCheck = true;
                        reload({
                            tags: this.tags,
                            table: res.table
                        });
                        this.saving = false;
                        this.$close();
                    });
                };

                this.selectTicker = (ticker) => {
                    location.replace('#/tags?ticker='+ticker);
                    location.reload();
                };

                this.cancel = () => this.$close();
            }
        });
    };

    this.refreshTag = (tag) => {
        const ticker = $state.params.ticker ? $state.params.ticker : tag.tickers[0];
        tag.refreshing = true;
        ApiFactory.refreshTag({ ticker: ticker }, tag.term_id).then((status) => {
            delete tag.refreshing;
            if (status === 'Success') {
                $scope.$emit("display.notification", `${tag.term} refreshed!`, 'success', 4000);
            } else {
                $scope.$emit("display.notification", 'There was a problem refreshing this tag, let a dev know!', 'failure', 4000);
            }
        });
    };

    this.editCategory = (tags) => {
        const checkedTags = TagsFactory.getChecked(tags);

        const editCategoryModal = $uibModal.open({
            controllerAs: 'ecm',
            bindToController: true,
            templateUrl: 'tags/view/edit_category_modal.html',
            windowClass: 'tags-modal',
            resolve: {
                tags: () => checkedTags
            },
            controller: function(tags) {

                this.$onInit = () => {
                    this.tags = tags;
                    this.newCategory = 'brand';
                };

                this.cancel = () => this.$close();

                this.updateCategories = () => {
                    const change = (tag) => {
                        tag.tag = this.newCategory;
                        changeCategory(tag);
                    };

                    R.map(change, this.tags);

                    this.$close();
                };
            }
        });
    };

    this.allCheckedChanged = (all) => this.noCheck = TagsFactory.allRowsChecked(all);

    this.rowChecked = () => this.noCheck = R.none(R.propEq('checked', true), this.tags);

    this.massDelete = (tags) => TagsFactory.massDelete(tags, null, this.isSearch).then((res) => {
        this.tags = res.tags;
        this.noCheck = true;
        this.onReload({
            tags: this.tags,
            table: res.table
        });
    });

    this.deleteTag = (tag) => this.onDelete({ tag: tag });

    this.massExactMatch = (tags) => TagsFactory.massExactMatch(tags);

    this.changeEventPriority = (tag, type=null) => {
        this.onUpdate({
            tag: tag,
            type: type
        }).then((tag) => {
            let term, event, priority;

            if (Array.isArray(tag)) {
                term     = tag[0].term;
                event    = !!tag[0].event;
                priority = !!tag[0].priority;
            }
            else {
                term     = tag.term;
                event    = tag.event;
                priority = tag.priority;
            }

            tag.event    = !!event;
            tag.priority = !!priority;
            $scope.$emit("display.notification", term+' updated!', 'success', 2000);
        });
    };

    this.reportApprove = (tag) => {
        this.onApprove({ tag: tag });
    };

    this.reportDeny = (tag) => {
        this.onDeny({ tag: tag });
    };

    this.$onInit = () => {
        let isSearch = this.isSearch = !!$state.params.search;
        this.loading = R.isEmpty(this.tags);
        this.tagSearch = '';
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on("tags.table.order.date", (event) => setupOrderDate());
}

module.exports = tagsTable;