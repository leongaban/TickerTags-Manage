const utility = angular
    .module('tickertags-shared')
    .factory('Util', Utility);

Utility.$inject = [];

function Utility() {

    const addOne = (n) => n + 1;

    const isNot = R.compose(R.not, R.match);

    const isTrue = R.equals(true);

    const isFalse = R.compose(R.not, isTrue);

    const isType = R.type;

    const isSpike = R.propEq("type", "spike");
	
    const isInsight = R.propEq("type", "insight");

    const isMomentum = R.propEq("type", "momentum");

    const notEmpty = R.compose(R.not, R.isEmpty);

    const notIdentical = R.compose(R.not, R.identical);

    const uniqFlat = R.compose(R.uniq, R.flatten);

    const uniques = R.uniq;

    const returnItem = (i) => i;

    const encodeTicker = (ticker) => {
        const tickerString  = ticker.ticker ? ticker.ticker : ticker;
        return tickerString.replace(/\//i, '%2F');
    };
    
    const changeKeyName = R.curry((from, to, object) => {
        const content = object[from];
        const property = R.lensProp(to);
        const addProperty = R.set(property, content);
        const removeProperty = R.omit([from]); // Ramda omit needs an Array type to work properly
        const swapProperty = R.compose(removeProperty, addProperty);
        return swapProperty(object);
    });

    const change = (alert) => {
        const typeProp = R.propEq('type');
        const assocType = R.assoc('type');
        alert = typeProp('spike', alert) ? assocType('tag_breaking', alert) : alert;
        alert = typeProp('momentum', alert) ? assocType('tag_momentum', alert) : alert;
        alert = typeProp('insight', alert) ? assocType('tag_insight', alert) : alert;
        return alert;
    };

    const supportLegacyAlert = (body, serverSafe = true) => {
        const changeKey = serverSafe ? changeKeyName : R.flip(changeKeyName);
        const changeInsight = changeKey('tag_insight', 'insight');
        const changeSpike = changeKey('tag_breaking', 'spike');
        const changeMomentum = changeKey('tag_momentum', 'momentum');
        const safe = R.compose(change, changeInsight, changeSpike, changeMomentum);
        return safe(body);
    };

    const uiSafe = (alert) => R.equals('spike', alert) ? 'breaking' : alert;

    // http://stackoverflow.com/a/40011873/3196675
    const capitalize = R.compose(R.join(''), R.juxt([R.compose(R.toUpper, R.head), R.tail]));

    const sortByKey = (array, key) => {
        return array.sort((a, b) => {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };

    const notEqual = R.complement(R.equals);
    const existIndex = notEqual(-1);

    // let isFalse = item => R.equals(false, item);
    // return R.any(isFalse)(hasTickersArray);

    ////////////////////////////////////////////////////////////////////////////
    return {
        existIndex         : existIndex,
        uiSafe             : uiSafe,
        capitalize         : capitalize,
        supportLegacyAlert : supportLegacyAlert,
        addOne             : addOne,
        isNot              : isNot,
        isTrue             : isTrue,
        isFalse            : isFalse,
        isType             : isType,
        isSpike            : isSpike,
        isInsight          : isInsight,
        isMomentum         : isMomentum,
        notEmpty           : notEmpty,
        notIdentical       : notIdentical,
        uniqFlat           : uniqFlat,
        uniques            : uniques,
        returnItem         : returnItem,
        encodeTicker       : encodeTicker,
        changeKeyName      : changeKeyName,
        sortByKey          : sortByKey
    };
}

module.export = utility;