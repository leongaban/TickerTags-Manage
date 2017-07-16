////////////////////////////////////////////////////////////////////////////////
/**
 * @name addTagButtonComponent
 * @namespace Directives
 * @desc Directive for the Main Nav
 */

var addTagButtonComponent = angular
    .module('addTagButtonComponent', [])
    .controller('AddTagCtrl', AddTagCtrl)
    .component('addTagButton', {
        templateUrl  : "tags/view/add_tag_button.html",
        controller   : AddTagCtrl,
        controllerAs : 'add',
        transclude   : true,
        bindings     : {}
    });

AddTagCtrl.$inject = [
    '$q',
    '$scope',
    '$uibModal',
    'ApiFactory'
];

function AddTagCtrl(
    $q,
    $scope,
    $uibModal,
    ApiFactory) {

    this.$onInit = () => {
        // console.log('$onInit addTagButton', this);
    };

    this.clickAddTag = () => {
        const ticker = '';
        const propTicker = R.propEq('ticker');

        const addTagModal = $uibModal.open({
            controllerAs: 'atm',
            bindToController: true,
            templateUrl: 'tags/view/add_tag_modal.html',
            windowClass: 'tags-modal',
            resolve: {
                ticker: () => ticker
            },
            controller: function(ticker) {
            
                this.$onInit = () => {
                    this.ticker = ticker;
                    this.newTerm = '';
                    this.chooseTickerInput = '';
                    this.newCategory = 'brand';
                    this.heightTall = false;
                    this.chooseTickersCtrl = null;
                    this.chosenTickers = [];
                    let newCategory = this.newCategory;
                };

                const runErrorChecks = () => {
                    if (this.newTerm === '') {
                        return false;
                    } else if (this.newTerm != '' && this.chosenTickers.length === 0) {
                        return false;
                    } else if (this.newTerm != '' && this.chosenTickers.length > 0) {
                        return true;
                    }
                };

                const failedDisplayErrors = () => {
                    if (this.newTerm === '') {
                        $scope.$emit("display.notification", 'Please enter a term', 'failure', 4000);
                    } else if (this.newTerm != '' && this.chosenTickers.length === 0) {
                        $scope.$emit("display.notification", 'Please choose ticker(s)', 'failure', 4000);
                    }
                };

                const saveTag = (newTerm) => {
                    const deferred = $q.defer();
                    let saveComplete = 0;

                    for (let i=0; i<this.chosenTickers.length; i++) {
                        ApiFactory.saveTerm(newTerm.term, newTerm.tag, this.chosenTickers[i].ticker).then((data) => {
                            saveComplete++;
                            if (saveComplete === this.chosenTickers.length) deferred.resolve();
                        });
                    }
                    
                    return deferred.promise;
                };

                const passedSaveTerm = () => {
                    const newTerm = {
                        active: 1,
                        parse_tree : {
                            exlude  : [],
                            include : []
                        },
                        tag     : this.newCategory,
                        term    : this.newTerm,
                        term_id : 0,
                        tickers : this.chosenTickers
                    };

                    newTerm.parse_tree.tag = this.newCategory;
                    newTerm.parse_tree.include.push({ term: this.urlTicker });

                    saveTag(newTerm).then(() => {
                        $scope.$emit("display.notification", this.newTerm+' saved!', 'success', 2000);
                        // $scope.$emit("load.tags");
                        this.$close();
                    });
                };

                this.register = (child) => this.chooseTickersCtrl = child;

                this.selectTicker = (ticker) => {
                    this.chosenTickers.push(ticker);
                    this.heightTall = false;
                };

                this.removeTicker = (ticker) => {
                    this.chosenTickers = R.reject((propTicker(ticker.ticker)), this.chosenTickers);
                };

                this.clickedAddTag = () => {
                    runErrorChecks() ? passedSaveTerm() : failedDisplayErrors();
                };

                this.tickerSearch = (ticker) => {
                    this.heightTall = true;
                    this.ticker = ticker;
                    this.chooseTickersCtrl.tickerTyping(this.ticker)
                };

                this.cancel = () => this.$close();
            }
        });

        addTagModal.closed.then((res) => {});
        addTagModal.result.then((tag) => {});
    }
}

module.exports = addTagButtonComponent;