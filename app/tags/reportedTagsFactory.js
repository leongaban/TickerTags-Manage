////////////////////////////////////////////////////////////////////////////////
/**
 * @name reportedTagsFactory
 * @namespace Factories
 * @desc Retrieves and updates the reported tags
 */

var reportedTagsFactory = angular
    .module('reportedTagsFactory', [])
    .factory('ReportedTagsFactory', factory);

factory.$inject = ['$rootScope', 'ApiFactory'];

function factory($rootScope, ApiFactory) {

    /** Init ReportedTagsFactory scope */
    /** --------------------------------------------------------------------- */
    var vm = {};
        vm.reportedTotal = 0;

    var reportedTagsFactory = {
        getTagsReportedTotal  : getTagsReportedTotal,
        storeReportedTotal    : storeReportedTotal,
        retrieveReportedTotal : retrieveReportedTotal
    };

    return reportedTagsFactory;
    ////////////////////////////////////////////////////////////////////////////
    
    function getTagsReportedTotal() {
        return ApiFactory.getReportedTerms(true).then(function(tag_reports) {
            if (tag_reports.length > 0) {
                storeReportedTotal(tag_reports.length);
            }
        });
    }

    function storeReportedTotal(total) {
        vm.reportedTotal = total;
    }

    function retrieveReportedTotal() {
        return vm.reportedTotal;
    }
}

module.exports = reportedTagsFactory;