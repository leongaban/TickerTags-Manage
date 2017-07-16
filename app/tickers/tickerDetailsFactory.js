////////////////////////////////////////////////////////////////////////////////
/**
 * @name tickerDetailsFactory
 * @namespace Factories
 * @desc Creates a ticker details object to render in views
 */

var tickerDetailsFactory = angular
    .module('tickerDetailsFactory', [])
    .factory('TickerDetailsFactory', factory);

factory.$inject = ['$q', 'ApiFactory'];

function factory($q, ApiFactory) { 

    // Function expressions ////////////////////////////////////////////////////
    const returnDirection = (conditional) => {
        switch(conditional) {
            case '-' : return 'negative'; break;
            default  : return 'positive';
        }
    };

    const getDetails = (ticker) => {
        if (ticker) {
            return ApiFactory.getTickerDetails(ticker).then((detailedTicker) => {
                const tickerObject = {};
                let conditional = '';

                tickerObject.ticker  = detailedTicker.ticker;
                tickerObject.name    = detailedTicker.longname;
                tickerObject.current = detailedTicker.current_ask;
                tickerObject.percent = detailedTicker.current_changepercent;
                tickerObject.amount  = detailedTicker.current_change_amount;
                if (tickerObject.percent) conditional = tickerObject.percent.toString().charAt(0);
                if (!tickerObject.current) tickerObject.current = 0;
                if (!tickerObject.amount)  tickerObject.amount  = 0;
                if (!tickerObject.percent) tickerObject.percent = 0;
                tickerObject.direction = returnDirection(conditional);
                // console.log(' ApiFactory.getTickerDetails tickerObject:',tickerObject);
                return tickerObject;
            });
        }
        else {
            return Promise.resolve();
        }
    };

    return {
        getDetails : getDetails
    };
}

module.exports = tickerDetailsFactory;