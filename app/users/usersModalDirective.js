////////////////////////////////////////////////////////////////////////////////
/**
 * @name userModalDirective
 * @namespace Directives
 * @desc Directive for the Main Nav
 */

const userModalDirective = angular
    .module('userModalDirective', [])
    .controller('UserModalCtrl', UserModalCtrl)
    .directive('userModal', userModalFunc);

function userModalFunc() {
    return {
        templateUrl: "users/user_modal.html",
        restrict: "E",
        replace: true,
        bindToController: true,
        controller: 'UserModalCtrl as user_modal',
        scope: false
    };
}

UserModalCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$timeout',
    'ApiFactory',
    'UsersFactory',
    'Util'];

function UserModalCtrl(
    $rootScope,
    $scope,
    $timeout,
    ApiFactory,
    UsersFactory,
    Util) {

    // Variables ///////////////////////////////////////////////////////////////
    const isEmpty = R.isEmpty;
    const notEmpty = Util.notEmpty;
    const vm                    = this;
          vm.show               = false;
          vm.choseTickersLoaded = false;
          vm.error              = false;
          vm.passwordReset      = false;
          vm.showingTickerList  = false;
          vm.modalType          = 'edit';
          vm.firstName          = '';
          vm.lastName           = '';
          vm.userRole           = '';
          vm.chooseTickerInput  = '';
          vm.userStatus         = 1;

    let currentView = 'usersView';

    vm.userObject = {
        active_flag  : true,
        active       : 1,
        id           : 0,
        role_id      : 0,
        role         : '',
        firstname    : '',
        lastname     : '',
        username     : '',
        user_tickers : []
    };

    vm.roles = [
        { 'id': 1, 'name': 'Admin' },
        { 'id': 2, 'name': 'Intern' },
        { 'id': 3, 'name': 'Curator' },
        { 'id': 4, 'name': 'Beta' },
        { 'id': 5, 'name': 'Retail' },
        { 'id': 6, 'name': 'Pending' }
    ];

    const defineRole = (roleId) => {
        switch(roleId) {
            case 1: return 'Admin';
            case 2: return 'Intern';
            case 3: return 'Curator';
            case 4: return 'Beta';
            case 5: return 'Retail';
            case 6: return 'Pending';
        }
    };

    const returnTickers = (user_ticker) => {
        return { ticker: user_ticker };
    };

    const wireEditModal = (user) => {
        vm.userObject.username  = user.username;
        vm.userObject.id        = user.id;

        ApiFactory.getUser(user.id).then((user) => {
            vm.userObject.firstname = user.firstname;
            vm.userObject.lastname  = user.lastname;
            vm.userObject.role_id   = user.role_id;
            vm.userObject.role = defineRole(user.role_id);
            if (notEmpty(user.user_tickers)) vm.userObject.user_tickers = R.map(returnTickers, user.user_tickers);
            // console.log(' vm.userObject.user_tickers',vm.userObject.user_tickers);
            if (vm.userObject.user_tickers.length > 0) vm.choseTickersLoaded = true;
        });
    };

    const wireAddModal = () => {
        vm.userObject.username  = '';
        vm.userObject.firstname = '';
        vm.userObject.lastname  = '';
        vm.userObject.role      = 'User';
        vm.userObject.role_id   = 4;
    };

    const setupModal = (user, type, from) => {
        console.log('setupModal', user);
        vm.show = true;
        vm.modalType = type;
        currentView = from;

        switch (type) {
            case 'edit' : wireEditModal(user); break;
            case 'add'  : wireAddModal(); break;
        }
    };

    const closingModalActions = () => {
        if (currentView === 'usersView')   { UsersFactory.updateUsers(vm.userObject); }
        if (currentView === 'tickersView') { $rootScope.$emit("ticker.get.all"); }
        closeModal();
    }

    const saveUser = () => {
        ApiFactory.saveUser(vm.userObject.id, vm.userObject).then(() => {
            closingModalActions();
            $rootScope.$emit("display.notification", vm.userObject.username+' updated!', 'success', 2000);
        });
    };

    const addUser = () => {
        ApiFactory.addUser(vm.userObject).then(() => {
            closingModalActions();
            $rootScope.$emit("display.notification", vm.userObject.username+' added!', 'success', 2000);
        });
    };

    const displayErrors = () => {
        vm.error = true;
        if (vm.userObject.firstname === '') {
            $rootScope.$emit("display.notification", 'Please type a First name', 'success', 2000);
        } else if (vm.userObject.lastname === '') {
            $rootScope.$emit("display.notification", 'Please type a Last name', 'success', 2000);
        }
    };

    const anyErrors = () => vm.userObject.firstname === '' || vm.userObject.lastname === '' ? true : false;

    const prepToSaveUser = () => {
        vm.userObject.active = vm.userObject.active_flag ? 1 : 0;

        switch(vm.userObject.role) {
            case 'Admin'   : vm.userObject.role_id = 1; break;
            case 'Intern'  : vm.userObject.role_id = 2; break;
            case 'Curator' : vm.userObject.role_id = 3; break;
            case 'Beta'    : vm.userObject.role_id = 4; break;
            case 'Retail'  : vm.userObject.role_id = 5; break;
            case 'Pending' : vm.userObject.role_id = 6; break;
        }

        let tempArray = vm.userObject.user_tickers.map(ticker => ticker.ticker);

        vm.userObject.user_tickers = tempArray;
        vm.userObject.tickers      = tempArray;

        if (vm.modalType === 'edit') {
            saveUser()
        } else if (vm.modalType === 'add') {
            addUser();
        }
    };

    const updateUser = () => {
        console.log('updateUser...');
        anyErrors() ? displayErrors() : prepToSaveUser();
    };

    const userTickerSearch = () => {
        let input = document.getElementById('chooseTickerInput');
        input.onkeydown = function() {
            let key = event.keyCode || event.charCode;
            if ( key == 8 || key == 46 ) {
                $timeout(() => {
                    if (vm.chooseTickerInput === undefined || vm.chooseTickerInput === '') {
                        $scope.$emit("close.choose.tickerlist");
                        vm.showingTickerList = false;
                    }
                }, 250);
            }
        };
        $scope.$emit("ticker_search.typing", vm.chooseTickerInput, 'fromAddTag');
        vm.showingTickerList = true;
    };

    const closeTickersSearch = () => {
        $scope.$emit("close.choose.tickerlist");
        vm.chooseTickerInput = '',
        vm.showingTickerList = false;
    };

    const removeTicker = (ticker) => {
        _.remove(vm.userObject.user_tickers, { ticker: ticker.ticker });
    };

    const resetPassword = () => {
        ApiFactory.resetPassword(vm.userObject.id).then(data => {
            vm.tempPassword  = data.password;
            vm.passwordReset = true;
        });
    };

    const removeUser = () => {
        vm.userObject.active = 0;
        ApiFactory.saveUser(vm.userObject.id, vm.userObject).then(data => {
            UsersFactory.updateUsers(vm.userObject);
            $rootScope.$emit("display.notification", vm.userObject.firstname+' '+vm.userObject.lastname+' removed!', 'success', 2000);
            closeModal();
        });
    };

    const closeModal = () => {
        if (vm.show) {
            vm.show = false;
            vm.showingTickerList = false;
            resetInputs();
            $rootScope.$emit("close.overlay");
        }
    };

    const resetInputs = () => {
        vm.userObject.active_flag  = true,
        vm.passwordReset           = false,
        vm.tempPassword            = '',
        vm.chooseTickerInput       = '',
        vm.userObject.user_tickers = [];
        $scope.$emit("close.choose.tickerlist");
    };

    // View model //////////////////////////////////////////////////////////////
    vm.updateUser         = updateUser,
    vm.userTickerSearch   = userTickerSearch,
    vm.closeTickersSearch = closeTickersSearch,
    vm.removeTicker       = removeTicker,
    vm.resetPassword      = resetPassword,
    vm.removeUser         = removeUser,
    vm.closeModal         = closeModal;

    // Events //////////////////////////////////////////////////////////////////
    $scope.$on("display.modal.user", (event, user, type, from) => { setupModal(user, type, from); });

    $scope.$on("chosen.ticker.selected", (event, ticker) => { vm.userObject.user_tickers.push(ticker); });

    $scope.$on("chosen.tickers.loaded", event => { vm.choseTickersLoaded = true; });

    $scope.$on("close.modal", event => { closeModal(); });
}

module.exports = userModalDirective;