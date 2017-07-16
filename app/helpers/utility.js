const utility = angular
    .module('utilityService', [])
    .factory('Util', Utility);

Utility.$inject = [];

function Utility() {

    const isNot = R.compose(R.not, R.match);

    const isTrue = R.equals(true);

    const notEmpty = R.compose(R.not, R.isEmpty);

    const replaceSlash = (ticker) => {
        if (ticker) {
            const escapedTicker = ticker.replace(/\//i, '%2F');
            return escapedTicker;
        }
    };

    const returnIfSomething = (item) => {
        if (item != '') {
            return item;
        }
    };

    const lowercaseFirstLetter = (string) => string.charAt(0).toLowerCase() + string.slice(1);

    // const notIdentical = R.compose(R.not, R.identical);

    // const uniqFlat = R.compose(R.uniq, R.flatten);

    // const uniques = R.uniq;
    
    // const changeKeyName = R.curry((from, to, object) => {
    //     const content = object[from];
    //     const property = R.lensProp(to);
    //     const addProperty = R.set(property, content);
    //     const removeProperty = R.omit([from]); // Ramda omit needs an Array type to work properly
    //     const swapProperty = R.compose(removeProperty, addProperty);
    //     return swapProperty(object);
    // });

    // const sortByKey = (array, key) => {
    //     return array.sort(function(a, b) {
    //         var x = a[key]; var y = b[key];
    //         return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    //     });
    // };

    ////////////////////////////////////////////////////////////////////////////
    return {
        isNot : isNot,
        isTrue : isTrue,
        notEmpty : notEmpty,
        replaceSlash : replaceSlash,
        returnIfSomething : returnIfSomething,
        lowercaseFirstLetter : lowercaseFirstLetter
        // notIdentical : notIdentical,
        // uniqFlat : uniqFlat,
        // uniques : uniques,
        // changeKeyName : changeKeyName,
        // sortByKey : sortByKey
    };
}

module.export = utility;