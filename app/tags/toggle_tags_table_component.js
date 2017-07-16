////////////////////////////////////////////////////////////////////////////////
/**
 * @name toggleTagsTables
 * @namespace Component
 * @desc Element component for the ToggleTagsTable tab buttons
 */

const toggleTagsTables = angular
	.module('tagsModule')
	.component('toggleTagsTable', {
		templateUrl  : "tags/view/toggle_tags_table.html",
		controller   : toggleTagsTableController,
		controllerAs : "ttt",
		bindings : {
			table: '<',
			totals: '<',
			onToggle: '&'
		}
	});

function toggleTagsTableController($state) {
	this.$onInit = function() {
		this.searchState = !!$state.params.search;
	};

	this.toggleTables = function(tab) {
		this.onToggle({ tab: tab });
	};
}

module.exports = toggleTagsTables;