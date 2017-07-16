/*global angular*/
////////////////////////////////////////////////////////////////////////////////
/**
 * @name TermWordCountFactory
 * @namespace Factories
 * @desc Generates, stores and retrieves Tickers & Tags combinations
 */

var termWordCountFactory = angular
    .module('termWordCountFactory', [])
    .factory('TermWordCountFactory', factory);

factory.$inject = [];

function factory() {

    // Clean and match sub-strings in a string.
    const extractSubstr = (str, regexp) => str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').toLowerCase().match(regexp) || [];

    // Find words by searching for valid characters between word-boundaries.
    const getWordsByWordBoundaries = (str) => extractSubstr(str, /\b[a-z\d]+\b/g);

    const countWords = (terms) => {
        _.each(terms, function(value, n) {
            if (value.term != null) {
                value.word_count = getWordsByWordBoundaries(value.term).length;
            }
            else if (value.term === null) {
                value.word_count = 0;
            }
        });
        return terms;
    };

    return {
        countWords : countWords
    }
}

module.exports = termWordCountFactory;