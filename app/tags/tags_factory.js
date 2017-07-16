////////////////////////////////////////////////////////////////////////////////
/**
 * @name tagsFactory
 * @namespace Factories
 * @desc Retrieves and updates the tags for the tagsDirective
 */

const tagsFactory = angular
    .module('tagsFactory', [])
    .factory('TagsFactory', factory);

factory.$inject = [
    '$q',
    '$timeout',
    '$rootScope',
    'ApiFactory',
    'TickersFactory',
    '$uibModal',
    'Util'];

function factory(
    $q,
    $timeout,
    $rootScope,
    ApiFactory,
    TickersFactory,
    $uibModal,
    Util) {

    // Variables ///////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;
    const TERMS            = {};
          TERMS.all        = {};
          TERMS.search     = {};
          TERMS.reports    = {};
          TERMS.event      = {};
          TERMS.priority   = {};
          TERMS.deleted    = {};
          TERMS.loadString = "limit=10000&start=0&order=start_epoch_desc";
    let TABLE = 'all';

    ////////////////////////////////////////////////////////////////////////////
    // Clean and match sub-strings in a string.
    const extractSubstr = (str, regexp) => {
        return str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').toLowerCase().match(regexp) || [];
    };

    const table = (type) => TABLE = type;
    const getTable = () => TABLE;

    const checked = R.filter(R.propEq('checked', true));
    const getChecked = checked;

    // Find words by searching for valid characters between word-boundaries.
    const getWordsByWordBoundaries = (str) => extractSubstr(str, /\b[a-z\d]+\b/g);

    const setWordCount = (tag) => {
        tag.word_count = getWordsByWordBoundaries(tag.term).length;
        return tag;
    };

    const countWords = (tags) => R.forEach(setWordCount, tags);

    const setEventPriority = (term) => {
        term.event    = term.event    === 1;
        term.priority = term.priority === 1;
        return term;
    };

    const normalizeUsernames = R.curry((type, tag) => {
        if (type === 'all') {
            return R.assoc('username', tag.added_username, tag);
        }
        else if (type === 'deleted') {
            return R.assoc('username', tag.removed_username, tag);
        }
    });

    const normalizeTags    = R.compose(normalizeUsernames('all'),     setWordCount, setEventPriority);
    const normalizeDeleted = R.compose(normalizeUsernames('deleted'), setWordCount, setEventPriority);

    const getTags = (key, ticker, params = null) => {

        // ToDo: Remove after pagination release
        if (ticker === 'dva' || ticker === 'DVA') {
            TERMS.loadString = "limit=200&start=0&order=start_epoch_desc";
        }

        return ApiFactory.retrieveAllTerms(ticker, params, TERMS.loadString)
            .then((data) => {
                // console.log('getTags', data);
                if (key === 'deleted') {
                    TERMS[key].terms = R.map(normalizeDeleted, data.ticker_tags);
                }
                else {
                    TERMS[key].terms = R.map(normalizeTags, data.ticker_tags);
                }

                TERMS[key].total = data.ticker_tags_rows;

                return TERMS[key];
            })
            .catch(apiError);
    };

    const storeSearchModel = (tags, table) => {
        TERMS[table].terms = R.map(normalizeTags, data.ticker_tags);
        TERMS[table].total = data.ticker_tags_rows;
        return TERMS[table];
    };

    const gup = (name, url) => {
        if (!url) url = location.href;
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        const regexS = "[\\?&]"+name+"=([^&#]*)";
        const regex  = new RegExp( regexS );
        let results  = regex.exec( url );
        return results == null ? null : results[1];
    };

    const getSearchedTags = (term) => {
        return ApiFactory.search(term).then(ticker_tags => {
            if (ticker_tags.length > 0) {
                TERMS.all.total = ticker_tags.length;
                TERMS.all.terms = R.map(normalizeTags, ticker_tags);
                return TERMS.all;
            } else {
                // This msg will show up because of loadSearch in tagsComponent
                // console.log('No results');
            }
        });
    };

    const NO_REPORTS = () => {
        TERMS.reports.total = 0;
        return TERMS.reports;
    };

    const lowerCaseCategory = (tag) => {
        tag.tag = Util.lowercaseFirstLetter(tag.tag);
        return tag;
    };

    const get_reports_for_ticker = (reports, urlTicker, option) => {
        const myReports = _.filter(reports, (tag_report) => {
            return tag_report.ticker === urlTicker;
        });

        const reportedTerms  = option !== 'getReports' ? myReports : reports;
        const reportsCounted = countWords(reportedTerms);
        const cleanedReports = R.map(lowerCaseCategory, reportsCounted);

        TERMS.reports = {
            terms : cleanedReports,
            total : reportedTerms.length
        };

        return TERMS.reports;
    };

    const getReportedTags = (getAllReported, urlTicker, refreshed, option) => {
        return ApiFactory.getReportedTerms(getAllReported).then((tag_reports) => {
            return !!tag_reports ? get_reports_for_ticker(tag_reports, urlTicker, option) : NO_REPORTS();
        });
    };

    const runErrorChecks = (newTerm) => {
        if (newTerm === '') {
            return false;
        } else if (newTerm != '' && TERMS.chosenTickers.length === 0) {
            return false;
        } else if (newTerm != '' && TERMS.chosenTickers.length > 0) {
            return true;
        }
    };

    const failedDisplayErrors = (newTerm) => {
        if (newTerm === '') {
            $rootScope.$emit("display.notification", 'Please enter a term', 'failure', 4000);
        } else if (newTerm != '' && TERMS.chosenTickers.length === 0) {
            $rootScope.$emit("display.notification", 'Please choose ticker(s)', 'failure', 4000);
        }
        return;
    };

    const prepNewTag = R.curry((term, category, ticker) => {
        return ApiFactory.saveTerm(term, category, ticker).then((res) => res);
    });

    const propTickers = R.prop('ticker');

    const saveTag = (newTerm) => {
        const tagTickers  = R.map(propTickers, TERMS.chosenTickers);
        const preloadSave = R.compose(prepNewTag(newTerm.term, newTerm.tag), propTickers);
        const prom = R.map(preloadSave, tagTickers);
        return $q.all(prom);
    };

    const passedSaveTerm = (urlTicker, newTerm, newCategory) => {
        const savedTerm = {
            active: 1,
            parse_tree : {
                exlude  : [],
                include : []
            },
            tag     : newCategory,
            term    : newTerm,
            term_id : 0,
            ticker  : urlTicker,
            tickers : TERMS.chosenTickers
        };

        savedTerm.parse_tree.tag = newCategory;
        savedTerm.parse_tree.include.push({ term: urlTicker });

        $rootScope.$emit("display.notification", savedTerm.term+' saved, tag ready within 30 minutes', 'success', 3000);

        return saveTag(savedTerm);
    };

    const addTag = (urlTicker, newTerm, newCategory) => {
        const currentTicker = { ticker: urlTicker };
        TERMS.chosenTickers = [];
        TERMS.chosenTickers.push(currentTicker);

        if (runErrorChecks(newTerm)) {
            return passedSaveTerm(urlTicker, newTerm, newCategory);
        } else {
            return failedDisplayErrors(newTerm);
        }
    };

    const updateTag = (newTerm, oldTerm, action = null, extra = null) => {
        if (action === 'category-update-only') {
            _.each(TERMS.all.terms, (value, i) => {
                if (oldTerm.term === TERMS.all.terms[i].term) {
                    TERMS.all.terms[i].tag     = newTerm.tag;
                    TERMS.all.terms[i].updated = true;
                    if (TERMS.all.terms) {
                        $timeout(() => { TERMS.all.terms[i].updated = false; }, 500);
                    }
                }
            });
        }
        else if (action === 'term-updated') {
            const singleArray = [];
                singleArray.push(newTerm);
            const tempArray   = countWords(singleArray);
            const updatedTerm = _.find(tempArray, 'term');

            updatedTerm.updated = true;
            $timeout(function() { updatedTerm.updated = false; }, 500);

            if (extra !== 'exact-match') {
                TERMS.all.terms.unshift(updatedTerm);
                for (let i=0; i<TERMS.all.terms.length; i++) {
                    if (oldTerm.id === TERMS.all.terms[i].id) {
                        TERMS.all.terms.splice(i, 1);
                    }
                }
            }
        }
        return TERMS.all.terms;
    };

    const updateForMultipleTickers = (tag) => {
        const id = tag.term_id;
        const term = tag.term;
        const event = Number(tag.event);
        const priority = tag.priority;
        tag.checkedTickers = R.map(TickersFactory.objectifyTicker, tag.tickers);

        const promises = tag.checkedTickers.map((ticker) => ApiFactory.updateTerm(1, id, tag, ticker.ticker, term, event, priority)
            .then((res) => {
                // console.log(' res', res);
                return res.config.data;
            })
        );

        return $q.all(promises);
    };

    const changeCategory = (tag, ticker) => {
        const newTerm = {
            active: 1,
            parse_tree : {
                exclude : [],
                include : []
            },
            tag     : tag.tag,
            term    : tag.term,
            term_id : tag.term_id,
            ticker  : ticker,
            tickers : []
        };

        newTerm.tickers.push(ticker);
        newTerm.parse_tree.tag = tag.tag;
        newTerm.parse_tree.include.push({ term: ticker });

        return ApiFactory.saveTerm(newTerm.term, newTerm.tag, newTerm.ticker).then((res) => {
            tag.updated = true;
            $timeout(() => { tag.updated = false; }, 500);
        }).catch(apiError);
    };

    const massChangeCategory = (tags) => {
        $rootScope.$emit("display.modal.category", checked(tags));
        $rootScope.$emit("modal.open");
    };

    const pad = any => `"${any}"`;
    const trim = sign => R.compose(R.join(sign),R.map(R.trim), R.split(sign));
    const pl = sign => R.compose(R.replace(sign, pad(sign)), trim(sign));
    const exactMatchTerm = R.compose(pad, pl('-'), pl('+'),R.replace(/\"/g, ``), R.prop('term'));

    const addExactTerm = (tag) => {
        const clone = R.clone(tag);
        tag.term = exactMatchTerm(clone);
        return tag;
    };

    const exactMatchTagsView = (tags) => {
        _.each(tags, (tag) => {
            let newTag = addExactTerm(tag);
            return ApiFactory.updateTerm(0, tag.term_id, tag, tag.ticker, tag.term).then((res) => {
                return ApiFactory.saveTerm(newTag.term, newTag.tag, newTag.ticker).then((res) => {
                    newTag.id = res.data.ticker_tag.term_id;
                    return updateTag(newTag, tag, 'term-updated', 'exact-match');
                }).catch(apiError);
            }).catch(apiError);
        });
    };

    const exactMatchTagsSearch = (tags) => {
        const promisesTags = tags.map((tag) => {
            let newTag = addExactTerm(tag);
            const promiseTickers = tag.tickers.map((ticker) => {
                return ApiFactory.updateTerm(0, newTag.term_id, newTag, ticker, newTag.term).then((res) => {
                    return ApiFactory.saveTerm(newTag.term, newTag.tag, ticker).then((res) => {
                        newTag.id = res.data.ticker_tag.term_id;
                        return updateTag(newTag, tag, 'term-updated', 'exact-match');
                    }).catch(apiError);
                }).catch(apiError);
            });
            return $q.all(promiseTickers);
        });

        return $q.all(promisesTags);
    };

    const massExactMatch = (tags) => {
        const checkedTags = checked(tags);
        const headTag = R.head(checkedTags);
        // tag.tickers = TagsSearch flow : tag.ticker = TagsView flow
        return R.isNil(headTag.ticker) ? exactMatchTagsSearch(checkedTags) : exactMatchTagsView(checkedTags);
    };

    const deleteTag = (tag, ticker = tag.ticker) => {
        return ApiFactory.updateTerm(0, tag.term_id, tag, ticker, tag.term);
    };

    const deleteBulkTags = R.map(deleteTag);

    const deleteTags = (tags) => $q.all(deleteBulkTags(tags)).catch(apiError);

    const rowDelete = (tag) => ApiFactory.updateTerm(0, tag.term_id, tag, tag.ticker, tag.term);

    const deleteFromTagsSearch = (tagsToDelete) => {
        const deletePromises = tagsToDelete.map((tag) => {
            const promiseTickers = tag.tickers.map((ticker) => {
                return deleteTag(tag, ticker).then((res) => {
                    return { tags: TERMS[TABLE].terms, table: TABLE };
                });
            });
            return $q.all(promiseTickers);
        });

        return $q.all(deletePromises).catch(apiError);
    };

    const massDelete = (tags, from, isSearch) => {
        const tagsToDelete = from === 'EditTagModal' ? [tags] : checked(tags);
        const bulkDelete = $uibModal.open({
            component: 'tagsBulkDelete',
            resolve: {}
        })
        return isSearch ? deleteFromTagsSearch(tagsToDelete).then((res) => {
            bulkDelete.dismiss();
            const flattened = R.flatten(R.head(res));
            return R.head(flattened);
        }) : deleteTags(tagsToDelete).then((res) => {
            bulkDelete.dismiss();
            const terms = R.reject(R.propEq('checked', true), TERMS.all.terms);
            return { tags: terms, table: TABLE };
        });
    };

    const rowsChecked = (type, tag) => {
        if (tag.checked && TERMS[type].noCheck) {
            TERMS[type].noCheck = false;
        }
        else {
            let checkFound = false;
            _.each(TERMS[type].terms, (value, i) => {
                if (TERMS[type].terms[i].checked) {
                    checkFound = true;
                }
            });

            TERMS[type].noCheck = !checkFound;
        }
        return TERMS[type].noCheck;
    };

    // http://www.somacon.com/p117.php
    const setAllCheckBoxes = (formName, fieldName, checkValue) => {
        if (!document.forms[formName]) {
            return;
        }

        const objCheckBoxes = document.forms[formName].elements[fieldName];

        if (!objCheckBoxes) return;

        const countCheckBoxes = objCheckBoxes.length;

        if (!countCheckBoxes) {
            objCheckBoxes.checked = checkValue;
        }
        else {
            _.each(objCheckBoxes, (value, i) => {
                objCheckBoxes[i].checked = checkValue;
            });
        }

        if (checkValue) {
            _.each(TERMS.all.terms, (value, i) => {
                TERMS.all.terms[i].checked = true;
            });
        }
        else {
            _.each(TERMS.all.terms, (value, i) => {
                TERMS.all.terms[i].checked = false;
            });
        }
    };

    const allRowsChecked = (all) => {
        if (all) {
            setAllCheckBoxes('tagsForm', 'checkBox', true);
            return false;
        } else {
            setAllCheckBoxes('tagsForm', 'checkBox', false);
            return true;
        }
    };

    const approveTag = (tag, comingFrom) => {
        return ApiFactory.saveTerm(tag.term, tag.tag, tag.ticker).then((res) => {
            // Add approved term to tags model:
            if (comingFrom === 'tagsView') {
                TERMS.all.terms.push(res.data.ticker_tag);
                TERMS.all.total++;
            }

            return ApiFactory.deleteReport(tag.ticker, tag.term, tag.user_id).then(() => {
                return tag;
            }).catch((error) => {
                console.log('\n approveTag deleteReport error:', error);
            });

        }).catch((error) => {
            console.log('\n approveTag error:',error);
        });
    };

    const denyTag = (tag) => {
        return ApiFactory.deleteReport(tag.ticker, tag.term, tag.user_id).then(() => {
            return tag;
        }).catch(apiError);
    };

    const tickerTypeing = () => {
        const input = document.getElementById('searchTickersInput');
            input.onkeydown = function() {
                const key = event.keyCode || event.charCode;
                if ( key == 8 || key == 46 ) {
                    $timeout(() => {
                        if (TERMS.searchTickersInput === undefined || TERMS.searchTickersInput === '') {
                            $rootScope.$emit("close.choose.tickerlist");
                        }
                    }, 250);
                }
            };
    };

    const resetToAllTags = () => TERMS.all.terms = TERMS.all.terms;

    ////////////////////////////////////////////////////////////////////////////
    return {
        getTags : getTags,
        storeSearchModel : storeSearchModel,
        getSearchedTags : getSearchedTags,
        getReportedTags : getReportedTags,
        addTag : addTag,
        updateTag : updateTag,
        table : table,
        getTable : getTable,
        getChecked : getChecked,
        updateForMultipleTickers : updateForMultipleTickers,
        changeCategory : changeCategory,
        massChangeCategory : massChangeCategory,
        massExactMatch : massExactMatch,
        exactMatchTerm : exactMatchTerm,
        countWords : countWords,
        rowDelete : rowDelete,
        rowsChecked : rowsChecked,
        allRowsChecked : allRowsChecked,
        massDelete : massDelete,
        approveTag : approveTag,
        denyTag : denyTag,
        tickerTypeing : tickerTypeing,
        resetToAllTags : resetToAllTags,
        normalizeTags : normalizeTags
    }
}
module.exports = tagsFactory;