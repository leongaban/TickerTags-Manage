////////////////////////////////////////////////////////////////////////////////
/**
 * @name tagsHeader
 * @namespace Component
 * @desc Element component for Tags view header (Ticker details & Add Tag Bar)
 */

const tagsHeader = angular
	.module('tagsModule')
	.component('tagsHeader', {
		templateUrl  : "tags/view/tags_header.html",
		controller   : tagsHeaderController,
		controllerAs : "thc",
		bindings : {
			ticker: '<',
			onLoad: '&'
		}
	});

function tagsHeaderController(TagsFactory) {
	this.$onInit = () => {
		this.newTerm 	 = '';
		this.newCategory = 'brand';
		this.percent     = true;
		this.event 		 = false;
		this.priority    = false;
	};

	this.submitNewTag = () => {
        return TagsFactory.addTag(this.ticker, this.newTerm, this.newCategory).then((res) => {
			this.newTerm = '';
			// this.onLoad({}).then((res) => {
			// 	// console.log(' onLoad', res);
			// });
        });
    };

	this.togglePercent = () => this.percent = !this.percent;

	this.gotoQuarterlyReports = (ticker) => {
        window.open('#/quarterly_reports?ticker=' + encodeURIComponent(ticker), '_self');
    };
}

module.exports = tagsHeader;