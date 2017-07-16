////////////////////////////////////////////////////////////////////////////////
/**
 * @name Message
 * @namespace Factories
 * @desc Handles the success and failure messages
 */

module.exports = angular
    .module('tickertags-message-module', [])
    .controller('modalController', modalController)
    .factory('Message', factory);

function modalController(msg, success) {
	this.msg = msg;
	this.success = success;
    this.cancel = () => this.$close();
}

factory.$inject = [
	'$uibModal'];

function factory(
	$uibModal) {

	const display = R.curry((msg, success) => {
		const modal = $uibModal.open({
            controllerAs: 'm',
            bindToController: true,
            templateUrl: 'message/message.html',
            windowClass: 'dash-modal',
            resolve: {
            	msg: () => msg,
            	success: () => success
            },
            controller: 'modalController'
        });
	});

    const success = display(R.__, true);

    const failure = display(R.__, false);

	return {
		display,
        success,
        failure
	}
}
