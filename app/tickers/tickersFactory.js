////////////////////////////////////////////////////////////////////////////////
/**
 * @name TickersFactory
 * @namespace Factories
 * @desc Service to GET and handle tickers
 */

var tickersFactory = angular
    .module('tickersFactory', [])
    .factory('TickersFactory', factory);

factory.$inject = [
    '$location',
    'ApiFactory',
    'Util'];

function factory(
    $location,
    ApiFactory,
    Util) {

    const apiError = ApiFactory.apiError;
    const myTickers = [];
    const tickersFactory = {
        myTickers : [],
        currentTicker : null
    };

    ////////////////////////////////////////////////////////////////////////////
    const storeTicker = (ticker) => tickersFactory.currentTicker = ticker;

    const getTicker = () => tickersFactory.currentTicker;

    const getMyTickers = (id, start, limit, order) => {
        const parameters = [];
        let url = '/app/api/tickers/manage';

        if (start) { parameters.push('start=' + start); }
        if (limit) { parameters.push('limit=' + limit); }
        if (order) { parameters.push('order=' + order); }
        if (id)    { parameters.push('user_id=' + id);  }
        if (parameters.length > 0) { url += '?' + parameters.join('&'); }

        return ApiFactory.getManageTickers('?' + parameters).then((myTickers) => {
            tickersFactory.myTickers = myTickers;
            return tickersFactory.myTickers;
        });
    };

    const getUrlTicker = () => $location.search().ticker;

    const getEscapedTicker = () => {
        const storedTicker  = getTicker();
        const currentTicker = R.isNil(storedTicker) ? getUrlTicker() : storedTicker;
        const escapedTicker = Util.replaceSlash(currentTicker);
        return escapedTicker;
    };

    const objectifyTicker = (ticker) => {
        return { ticker: ticker, checked: false };
    };

    return {
        storeTicker      : storeTicker,
        getTicker        : getTicker,
        getUrlTicker     : getUrlTicker,
        getMyTickers     : getMyTickers,
        getEscapedTicker : getEscapedTicker,
        objectifyTicker  : objectifyTicker
    }
}

module.exports = tickersFactory;