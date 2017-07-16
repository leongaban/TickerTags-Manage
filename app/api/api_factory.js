////////////////////////////////////////////////////////////////////////////////
/**
 * @name ApiFactory
 * @namespace Factories
 * @desc Application wide REST APIS
 */

var apiFactory = angular
    .module('apiFactory', [])
    .factory('ApiFactory', factory);

factory.$inject = [
    '$http',
    '$rootScope',
    'Util'];

function factory(
    $http,
    $rootScope,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const apiError = (error, message = 'Error occurred during request') => {
        console.log('apiError:', message);
        return error;
    };

    // Authentication & Credentials ////////////////////////////////////////////
    const userLogin = (usr, pass) => {
        var post_data = {
            username : usr,
            password : pass
        };

        return $http.post('/app/api/login', post_data).then(res => res).catch(apiError);
    };

    const userPasswordReset = (email) => $http.delete('/app/api/login/password/public?email='+email);

    const userPasswordChange = (credentials) => $http.put('/app/api/login/password/', credentials);

    const getUserDetails = () => $http.get('/app/api/login', { cache: true });

    // Search & Ticker Tags CRUD ///////////////////////////////////////////////
    const quotes = (url) => $http.get(url, { cache: true });

    const search = (search) => $http.get('/app/api/ticker_tags/?search='+search).then(res => res.data.ticker_tags).catch(apiError);

    const tsearch = (ticker, search) => $http.get('/app/api/ticker_tags/public?search=' + search + '&ticker=' + encodeURIComponent(ticker) + '&limit=5').then(res => res.data.ticker_tags).catch(apiError);

    const getTickerQuotes = (ticker, limit_range = '') => {
        return $http.get('/app/api/tickers/quotes/'+ticker+limit_range, { cache: false });
    };

    const getTickerDetails = (ticker) => {
        // return $http.get('/app/api/tickers/?ticker='+ticker, { cache: false })
        return $http.get('/app/api/tickers/?ticker='+ticker).then(res => {
            return R.head(res.data.tickers);
        }).catch(apiError);
    };

    const getManageTickers = (params) => $http.get('/app/api/tickers/manage'+params, { cache: false }).then(res => res.data.tickers.data).catch(apiError);

    const getTags = (ticker, input = null, string = '') => {
        let args = [];

        if (input != null) {
            for (let key in input) {
                if (input[key] !== '')
                    args.push(key + '=' + input[key])
            }
        }
        else { args.push(string); }

        const url = '/app/api/ticker_tags/public/'+ticker+'?' + args.join('&');
        return $http.get(url, { cache: true }).catch(apiError);
    };

    // ToDo remove this, pass cache value in params
    const getTagsFresh = (ticker, input = input  || null, string = string || '') => {
        let args = [];

        if (input != null) {
            for (let key in input) {
                if (input[key] !== '')
                    args.push(key + '=' + input[key])
            }
        }
        else { args.push(string); }

        const url = '/app/api/ticker_tags/public/'+ticker+'?' + args.join('&');
        return $http.get(url, { cache: false }).catch(apiError);
    };

    const retrieveAllTerms = (ticker, input, string = string || '') => {
        const args = [];

        if (input != null) {
            for (let key in input) {
                if (input[key] !== '') {
                    args.push(key + '=' + input[key]);
                }
            }
        } else {
            args.push(string);
        }

        return $http.get('/app/api/ticker_tags/?ticker=' +ticker+ '&' +args.join('&')).then(res => res.data).catch(apiError);
        // return $http.get('/app/api/ticker_tags/'+ticker+'?' + args.join('&')).then(res => res.data).catch(apiError);
    };

    const getReportedTerms = (display_all) => {
        let parameters = '';
        if (display_all) parameters = '?display_all=1';
        return $http.get('/app/api/report' + parameters).then((res) => res.data.ticker_term_reports).catch(apiError);
    };

    const getTagData = (ticker, term_id) => $http.get('/app/api/ticker_tags/public/'+ticker+'/'+term_id, { cache: true }).catch(apiError);

    // Get additional ticker_tag details:
    const getTagDataSilm = (term_id) => $http.get('/app/api/ticker_tags/public?term_id='+term_id, { cache: false }).then(res => res.data.ticker_tag).catch(apiError);

    // Tickers Portfolio CRUD //////////////////////////////////////////////////
    const getWatchList = () => $http.get('/app/api/tickers/watch_list');

    const getWatchListRefresh = () => $http.get('/app/api/tickers/watch_list', { cache: false }).catch(apiError);

    const postWatchList = (ticker) => $http.post('/app/api/tickers/watch_list', { ticker: ticker }).catch(apiError);

    const shareChart = (data) => $http.post('/app/api/social/share/chart', data).catch(apiError);

    const deleteWatchList = (ticker) => $http.delete('/app/api/tickers/watch_list/'+ticker).catch(apiError);

    // Tags Watchlist CRUD /////////////////////////////////////////////////////
    const postFavList = (id) => $http.post('/app/api/favorites', { term_id : id }).catch(apiError);

    const deleteFavList = (id) => $http.delete('/app/api/favorites/'+id).catch(apiError);

    const getFavList = () => $http.get('/app/api/ticker_tags/public?favorite=1').catch(apiError);

    // Social Streams & Alerts CRUD ////////////////////////////////////////////
    const getAlerts = () => $http.get('/app/api/alerts').catch(apiError);

    const buildUrlParams = (ticker, term_id, vote_ticker, start, limit, start_epoch, end_epoch, media_type) => {
        const params_object = {
            ticker,
            term_id,
            vote_ticker,
            start,
            limit,
            start_epoch,
            end_epoch,
            media_type
        };

        const url_params = [];

        for (let key in params_object) {
            if (params_object.hasOwnProperty(key)) {
                if (params_object[key] !== null && params_object[key] !== undefined) {
                    url_params.push(key + '=' + params_object[key]);
                }
            }
        }

        return url_params.join('&');
    };

    const getNews = (ticker, term_id) => $http.get('/app/api/news/?ticker='+ticker+'&term_id='+term_id+'&media_type=financial').catch(apiError);

    const getTweets = (term_id, vote_ticker, start, limit, start_epoch, end_epoch) => {
        const url_params = buildUrlParams(null, term_id, vote_ticker, start, limit, start_epoch, end_epoch);
        return $http.get('/app/api/social/twitter?'+url_params).catch(apiError);
    };

    const tweetVote = (ticker, tweet_id, term_id, vote) => {
        const url  = '/app/api/social/twitter/' + ticker + '/' + tweet_id;
        const data = { 'term_id': term_id, 'vote': vote };
        return $http.put(url, data).catch(apiError);
    };

    const articleVote = (ticker, article_id, term_id, vote) => {
        const url  = '/app/api/news/' + ticker + '/' + article_id;
        const data = { 'term_id': term_id, 'vote': vote };
        return $http.put(url, data).catch(apiError);
    };

    const getTweetQuotes = (ticker) => $http.get('/app/api/tickers/quotes/'+ticker).catch(apiError);

    const getTweetVolume = (term_id, range = range || '') => $http.get('/app/api/social/twitter/volume/'+term_id+range).catch(apiError);

    const getTagCategories = (ticker) => $http.get('/app/api/ticker_tags/public/categories/'+ticker, { cache: true }).catch(apiError);

    const getSearchResults = (string) => $http.get('/app/api/ticker_tags/public?search='+string+'&limit=20', { cache: true }).catch(apiError);

    // Management Admin API ////////////////////////////////////////////////////
    const getRestMethod = (id) => $http.get('/app/api/rest_api/' + id).catch(apiError);

    const saveRestMethod = (id, data) => $http.put('/app/api/rest_api/' + id, data).catch(apiError);

    const addRestMethod = (data) => $http.post('/app/api/rest_api', data).catch(apiError);

    const getRestMethods = () => $http.get('/app/api/rest_api').then((res) => res.data).catch(apiError);

    const getUser = (user_id) => $http.get('/app/api/users/' + user_id).then((res) => res.data.user).catch(apiError);

    const retrieveUserSettings = () => $http.get('/app/api/user_settings').then((res) => res.data).catch(apiError);

    const saveUser = (user_id, data) => $http.put('/app/api/users/' + user_id, data).then((res) => res.data.status).catch(apiError);

    const addUser = (data) => $http.post('/app/api/users', data).then((res) => res.data.status).catch(apiError);

    const getUsers = (params = '') => $http.get('/app/api/users?'+params).then((res) => res.data).catch(apiError);

    const getBlacklist = () => $http.get('/app/api/ticker_tags/blacklist').catch(apiError);

    const addBlacklist = (term_id) => $http.post('/app/api/ticker_tags/blacklist', { term_id : term_id }).catch(apiError);

    const resetPassword = (user_id) => $http.delete('/app/api/login/password/'+user_id).then((res) => res.data).catch(apiError);

    const removeBlacklist = (term_id) => $http.delete('/app/api/ticker_tags/blacklist/'+term_id).catch(apiError);

    const getTagTree = (id, ticker) => $http.get('/app/api/ticker_tags/'+ticker+'/'+id).catch(apiError);

    // const saveTerm = (term, tag, ticker) => $http.post('/app/api/ticker_tags/'+ticker, { term : term, tag  : tag }).then((res) => res).catch(apiError);
    const saveTerm = (term, tag, ticker) => $http.post('/app/api/ticker_tags/?ticker='+ticker, { term: term, tag: tag }).then((res) => res).catch(apiError);

    const updateTerm = (active, id, tagObject=null, ticker=null, term=null, event=0, priority=0) => {
        tagObject.event    ? tagObject.event    = 1 : tagObject.event    = 0;
        tagObject.priority ? tagObject.priority = 1 : tagObject.priority = 0;

        const apiTicker = ticker.ticker ? ticker.ticker : ticker;
        const encodedTicker = Util.replaceSlash(apiTicker);

        const post_data = {
            tag: tagObject.tag,
            active,
            term,
            event,
            priority
        };

        // console.log('updateTerm id:', id);
        // console.log('post_data:', post_data);
        // console.log(' url:', '/app/api/ticker_tags/?ticker='+encodedTicker+'&term_id='+id);
        return $http.put('/app/api/ticker_tags/?ticker='+encodedTicker+'&term_id='+id, post_data).then((res) => res).catch(apiError);
    };

    const refreshTag = (ticker, term_id) => {
        const apiTicker = ticker.ticker ? ticker.ticker : ticker;
        const encodedTicker = Util.replaceSlash(apiTicker);
        return $http.put('/app/api/ticker_tags/?ticker='+encodedTicker+'&term_id='+term_id, { refresh: true }).then((res) => res.data.status).catch(apiError);
    };

    const getChanges = (ticker) => $http.get('/app/api/changes/'+ticker).catch(apiError);

    const convertString = (post_data) => $http.post('/app/api/ticker_tags/advanced', post_data).catch(apiError);

    const getTicker = (ticker, active) => $http.get('/app/api/tickers/?ticker=' + ticker + '&active=' + active).then((res) => res.data.tickers).catch(apiError);

    const getTickers = (search, active, verified, trading, limit) => {
        const parameters = [];
        if (limit !== undefined)    { parameters.push('limit=' + limit); }
        if (search !== undefined)   { parameters.push('search=' + search); }
        if (active !== undefined)   { parameters.push('active=' + active); }
        if (verified !== undefined) { parameters.push('verified=' + verified); }
        if (trading !== undefined)  { parameters.push('trading=' + trading); }
        return $http.get('/app/api/tickers/?' + parameters.join('&')).then((res) => res.data.tickers).catch(apiError);
    };

    const getTopicsList = (ticker, end_epoch) => {
        let url = '/app/api/topics';
        if (ticker)    { url += '/' + ticker }
        if (end_epoch) { url += '?end_epoch=' + epoch; }
        return $http.get(url).catch(apiError);
    };

    const topicsResponse = (response) => response.data.topics;

    const getTopics = (ticker, epoch) => {
        let url  = '/app/api/topics';
        if (ticker) { url += '/' + ticker }
        if (epoch)  { url += '?epoch=' + epoch; }
        return $http.get(url, { cache: true }).then(topicsResponse).catch(apiError);
    };

    const updateTopics = (body) => {
        const data = {
            epoch: body.epoch,
            score: body.score,
            terms: body.terms,
            tickers: body.tickers,
            topic_id: body.topic_id,
            annotations: body.annotations
        };

        return $http.post('/app/api/topics', data).then((success) => {
            $rootScope.$emit("display.notification", 'Topic successfully updated', 'success', 2000);
        }, (error) => {
            $rootScope.$emit("display.notification", 'Could not update topic', 'failure', 2000);
        });
    };

    const getTickersList = (input  = input  || null, string = string || '') => {
        const args = [];
        let url = '/app/api/tickers';

        if (input != null) {
            for (let key in input) {
                if (input[key] !== '') args.push(key + '=' + input[key])
            }
            url += '?';
        }
        else { args.push(string); }

        // return $http.get('/app/api/tickers', {cache: true});
        return $http.get(url + args.join('&'), {cache: true}).catch(apiError);
    }

    const updateTicker = (ticker, option) => {
        /*
            Important comments:
            If approve:  option = { 'verified': 1 }
            If deny:     option = { 'active': 0, 'verified': 1 }
            If transfer: option = tickerTo
        */
        // return $http.put('/app/api/tickers/' + ticker, option).then((res) => res).catch(apiError);
        return $http.put('/app/api/tickers/?ticker=' +ticker, option).then((res) => res).catch(apiError);
    };

    const addTicker = (ticker, company_name, admin) => {
        return $http.post('/app/api/tickers/', { ticker : ticker, company_name : company_name, admin : admin.id }).then((res) => res).catch(apiError);
    };

    const deleteReport = (ticker, term, user_id) => {
        return $http.delete('/app/api/report?ticker='+ticker+'&term='+encodeURIComponent(term)+'&user_id='+user_id).then((res) => res).catch(apiError);
    };

    const bulkaddRequest = (tickers, ticker_tags, tag, event, priority) => {
        return $http.post('/app/api/ticker_tags/bulk_upload',
            { 
                tickers : tickers,
                ticker_tags : ticker_tags,
                tag : tag,
                event: Number(event),
                priority: Number(priority)
            },
            { 'withCredentials': true })
            .then((res) => res).catch(apiError);
    };

    const postBlog = (post_data) => $http.post('/app/api/blog', post_data).then(res => res).catch(apiError);

    const postPeriodsData = (config_id, data_id, post_data) => $http.post('/app/api/tickers/periods/data?ticker_period_config_id=' + config_id + '&ticker_period_data_id=' + data_id, post_data).then(res => res).catch(apiError);
    const postPeriods = (post_data) => $http.post('/app/api/tickers/periods', post_data).then(res => res).catch(apiError);
    const putPeriods = (ticker_period_config_id, year, period, post_data) => 
        $http.put('/app/api/tickers/periods?ticker_period_config_id=' + encodeURIComponent(ticker_period_config_id) + '&period=' + period + '&year=' + year, post_data)
        .then(res => res).catch(apiError);

    const updatePeriods = (ticker_period_config_id, periods) => {
        return $http.put('/app/api/tickers/periods', {periods}, { params: { ticker_period_config_id, update: true } });
    };

    const postTickerPeriodReport = (post_data) => {
        return $http.post('/app/api/tickers/periods/reports', post_data).catch(apiError);
    };

    const postWebReport = (term_id, config_id, data_id, report_id, data) => {
        return $http.post('/app/api/tickers/periods/web_reports', {term_id, config_id, data_id, report_id, data});
    };

    const removeWebReport = (term_id, config_id, data_id) => $http.delete('/app/api/tickers/periods/web_reports',{params:{term_id, config_id, data_id}});

    const putTickerPeriodReport = (id, post_data) => $http.put('/app/api/tickers/periods/reports/' + id, post_data).then(res => res).catch(apiError);
    const postPeriodsConfig = (ticker, post_data) => $http.post('/app/api/tickers/periods/?ticker=' + encodeURIComponent(ticker), post_data).then(res => res).catch(apiError);

    const getPeriodData = (ticker_period_config_id) => {
        return $http.get('/app/api/tickers/periods/data', { params: { ticker_period_config_id } }).catch(apiError);
    };

    const deleteTickerPeriodReport = (id) => {
        return $http.delete('/app/api/tickers/periods/reports?id=' + id).catch(apiError);
    };

    const getTickerPeriodReports = (ticker_period_config_id) => {
        return $http.get('/app/api/tickers/periods/reports?ticker_period_config_id=' + encodeURIComponent(ticker_period_config_id)).catch(apiError);
    };

    const getPeriodConfigs = (ticker) => {
        return $http.get('/app/api/tickers/periods?ticker=' + encodeURIComponent(ticker)).catch(apiError);
    };

    const getPeriods = (ticker_period_config_id) => {
        return $http.get('/app/api/tickers/periods', { params: { ticker_period_config_id } }).catch(apiError);
    };

    const getReports = (ticker=null) => {
        return $http.get('/app/api/tickers/periods/web_reports', { params: { ticker } }).catch(apiError);
    };

    const deletePeriodsData = (data_id) => {
        return $http.delete('/app/api/tickers/periods/data?ticker_period_data_id='+encodeURIComponent(data_id)).then((res) => res).catch(apiError);
    };

    const runWebAnalytics = (term_id, ticker_period_config_id, data_id, report_period_type) => {
        return $http.get('/app/api/tickers/periods/web_report', { params: { term_id, ticker_period_config_id, data_id, report_period_type } });
    };

    const postBulkTerm = (post_data) => {
        return $http.post('/app/api/ticker_tags/bulk', post_data).catch(apiError);
    };

    const getSectors = () => {
        return $http.get('/app/api/tickers/sectors').catch(apiError);
    };

    const getBulkTerms = () => {
        return $http.get('/app/api/ticker_tags/bulk').catch(apiError);
    };

    const deleteBulkTerm = (bulk_term_id) => {
        return $http.delete('/app/api/ticker_tags/bulk?bulk_term_id=' + bulk_term_id).catch(apiError);
    };

    return {
        // Authentication
        userLogin,
        userPasswordReset,
        userPasswordChange,
        getUserDetails,

        // Search & Ticker Tags
        tsearch,
        search,
        getTickerQuotes,
        getTickerDetails,
        getManageTickers,
        getTags,
        getTagsFresh,
        getTagData,
        getTagDataSilm,
        getTagCategories,
        quotes,

        // Topics
        getTopics,
        getTopicsList,
        updateTopics,

        // Ticker Portfolio
        getWatchList,
        getWatchListRefresh,
        postWatchList,
        deleteWatchList,

        // Tag Watchlist
        postFavList,
        deleteFavList,
        getFavList,
        shareChart,

        // Social Streams
        getAlerts,
        getNews,
        getTweetQuotes,
        getTweets,
        getTweetVolume,
        tweetVote,
        articleVote,
        getSearchResults,

        // Management
        getRestMethod,
        saveRestMethod,
        addRestMethod,
        getRestMethods,
        getUser,
        getUsers,
        retrieveUserSettings,
        saveUser,
        addUser,
        getBlacklist,
        addBlacklist,
        resetPassword,
        removeBlacklist,
        retrieveAllTerms,
        getReportedTerms,
        getTagTree,
        saveTerm,
        updateTerm,
        refreshTag,
        getChanges,
        convertString,
        getTicker,
        getTickers,
        getTickersList,
        updateTicker,
        addTicker,
        deleteReport,
        postBlog,

        // Bulk Add
        bulkaddRequest,

        getSectors,
        getBulkTerms,
        postBulkTerm,
        deleteBulkTerm,

        // Periodly report data
        getTickerPeriodReports,
        putTickerPeriodReport,
        deleteTickerPeriodReport,
        postTickerPeriodReport,
        getPeriods,
        getPeriodConfigs,
        getPeriodData,
        postPeriods,
        putPeriods,
        postPeriodsData,
        postPeriodsConfig,
        deletePeriodsData,
        runWebAnalytics,
        getReports,
        postWebReport,
        removeWebReport,
        updatePeriods
    };
}

module.exports = apiFactory;