////////////////////////////////////////////////////////////////////////////////
/**
 * @name topicsDirective
 * @namespace Directives
 * @desc Directive for the Topics list view
 */

var topicsDirective = angular
    .module('topicsDirective', [])
    .controller('TopicsCtrl', TopicsCtrl)
    .directive('topicsView', topicsView);

function topicsView() {
    return {
        templateUrl: "topics/topics.html",
        restrict: "E",
        replace: true,
        bindToController: true,
        controller: TopicsCtrl,
        controllerAs: '_topics',
        scope: {}
    };
}

TopicsCtrl.$inject = [
    '$scope',
    'ApiFactory',
    'Notification'];

function TopicsCtrl($scope, ApiFactory, Notification) {

    const apiError = ApiFactory.apiError;
    const vm = this;

    vm.valuationDate = new Date();
    vm.valuationDatePickerIsOpen = false;
    vm.topicsLoaded = false;
    vm.dateOptions = {
        maxDate: new Date(),
        showWeeks: true
    };

    vm.getTopics = getTopics;
    vm.update = updateValue;
    vm.save = save;

    Notification.display()

    $scope.$watch(function () {
        return vm.valuationDate;
    }, function (value) {
        // console.log("valuationDate: " + value);
        vm.getTopics(undefined, value);
    });

    function updateTopics(response) {

        var fixTickerScore = function (ticker) {
            var rawScore = new Number(ticker.score);
            var cleanScore = rawScore.toFixed(1);
            return ticker.score = (cleanScore > 0) ? cleanScore : undefined;
        }

        var updateTickers = function (tickers) {
             _.map(tickers, function (ticker) {
                return fixTickerScore(ticker)
            });
        }
        
        var topics = _.each(response, function (topic) {
            updateTickers(topic.tickers);
        })

        vm.topics = topics;
        console.log('vm.topics',vm.topics);
        vm.topicsLoaded = true;
    }

    function getTopics(ticker, date, tickerData) {
        var epoch = date.getTime() / 1000;
        epoch = epoch - epoch % (24 * 60 * 60);
        ApiFactory.getTopics(ticker, epoch).then(updateTopics).catch(apiError);
    }

    function updateValue(annotations, option) {
        switch (option) {
            case 'broad':
                annotations['narrow'] = false
                break;
            case 'narrow':
                annotations['broad'] = false
                break;
            case 'not_applicable':
                annotations['applicable'] = false
                break;
            case 'applicable':
                annotations['not_applicable'] = annotations['spam'] = false;
                break;
            case 'spam':
                annotations[option] ? _.each(annotations, function(value, key){ if (key !== option) { annotations[key] = false } }) : _.noop();
        }
    }

    function save(topic) {
        ApiFactory.updateTopics(topic);
    }
}

module.exports = topicsDirective;
