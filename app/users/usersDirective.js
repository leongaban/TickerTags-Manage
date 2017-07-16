////////////////////////////////////////////////////////////////////////////////
/**
 * @name usersDirective
 * @namespace Directives
 * @desc Directive for the Users list view
 */

const usersDirective = angular
    .module('usersDirective', [])
    .controller('UsersCtrl', UsersCtrl)
    .directive('usersView', usersView);

function usersView() {
    const directive = {
        templateUrl      : "users/users.html",
        restrict         : "E",
        replace          : true,
        bindToController : true,
        controller       : UsersCtrl,
        controllerAs     : 'usrs',
        link             : link,
        scope            : {}
    };
    return directive;
    function link(scope, element, attrs) {}
}

UsersCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$uibModal',
    'ApiFactory',
    'TickersFactory',
    'UsersFactory',
    'Util'];

function UsersCtrl(
    $rootScope,
    $scope,
    $uibModal,
    ApiFactory,
    TickersFactory,
    UsersFactory,
    Util) {

    // Variables ///////////////////////////////////////////////////////////////
    const vm = this;
    const notEmpty = Util.notEmpty;
    vm.hidePagination = true;
    vm.usersLoaded    = false;
    vm.usersList      = [];
    vm.pages          = [];
    vm.start          = 0;
    vm.end            = 200;
    vm.num200         = 200;
    vm.currentPage    = 1;
    vm.userSearch     = '';

    let loadString = 'start='+vm.start+'&limit='+vm.end;

    // Function Expressions ////////////////////////////////////////////////////
    const displayUsersList = (users) => {
        vm.usersList   = users;
        vm.usersLoaded = true;
    };

    const searchUsers = _.debounce(() => {
        const start = vm.start = 0;
        const end = vm.end = 10000;
        const username = vm.userSearch;
        const firstname = vm.userSearch;
        const lastname = vm.userSearch;
        // loadString = `start=${start}&limit=${end}&search=${username}&firstname=${firstname}&lastname=${lastname}`;
        loadString = 'start='+vm.start+'&limit='+vm.end+'&search='+vm.userSearch;
        loadUsers(loadString);
    }, 250);

    const calculatePages = (total) => {
        const pageCount = Math.ceil(total / 200) + 1;
        for (let i=0; i<pageCount; i++) {
            vm.pages.push(i+1); // Fixes page 0 issue
        }
        // Removes last empty item:
        vm.pages.splice(-1, 1);
    };

    const gotoPage = (page) => {
        // Adjusts page 1 back to 0:
        const count = ((page - 1) * 200);

        vm.currentPage = page;
        vm.start       = count;
        vm.end         = count + vm.num200;

        if (vm.end > vm.totalUsers) vm.end = vm.totalUsers;

        loadString = 'start='+vm.start+'&limit='+vm.end;
        loadUsers(loadString);
    };

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

    const userModalParent = (userObject = null, type) => {
        const userModal = $uibModal.open({
            controllerAs: 'um',
            bindToController: true,
            templateUrl: 'users/view/user_modal.html',
            windowClass: 'tags-modal',
            resolve: {
                userObject: () => userObject,
                type: () => type
            },
            controller: function(userObject, type) {
                this.modalType = type;

                const wireUserModal = (userObject) => ApiFactory.getUser(userObject.id);

                const setupAddUser = () => {
                    this.userObject = {
                        active: 1,
                        active_flag: true,
                        username: '',
                        firstname: '',
                        lastname: '',
                        role: 'Beta',
                        role_id: 4,
                        user_tickers: []
                    }
                };

                this.modalType === 'edit'
                    ? wireUserModal(userObject).then((user) => {
                        this.userObject = user;
                        this.userObject.active_flag = true;
                        this.userObject.active = user.active;
                        this.userObject.role = defineRole(user.role_id);

                        if (notEmpty(user.user_tickers)) {
                            this.userObject.user_tickers = R.map(returnTickers, user.user_tickers);
                            this.userTickers = true;
                        }
                    })
                    : setupAddUser();

                this.register = (child) => this.chooseTickersCtrl = child;

                const anyErrors = (user) => user.firstname === '' || user.lastname === '' ? true : false;

                const displayErrors = (user) => {
                    if (user.firstname === '') {
                        $rootScope.$emit("display.notification", 'Please type a First name', 'success', 2000);
                    } else if (user.lastname === '') {
                        $rootScope.$emit("display.notification", 'Please type a Last name', 'success', 2000);
                    }
                };

                const saveUser = (userObject) => {
                    return ApiFactory.saveUser(userObject.id, userObject).then(() => {
                        const msg = type === 'edit' ? ' updated!' : ' added!';
                        UsersFactory.updateUsers(userObject);
                        userObject.user_tickers = R.map(TickersFactory.objectifyTicker, userObject.user_tickers);
                        $rootScope.$emit("ticker.get.all");
                        $rootScope.$emit("display.notification", userObject.username+msg, 'success', 2000);
                    });
                };

                const addUser = (userObject) => {
                    return ApiFactory.addUser(userObject).then((res) => {
                        this.showingTickerList = false;
                        userObject.user_tickers = R.map(TickersFactory.objectifyTicker, userObject.user_tickers);
                        $rootScope.$emit("display.notification", userObject.username+' added!', 'success', 2000);
                    });
                };

                const prepToSaveUser = (userObject, type) => {
                    userObject.active = userObject.active_flag ? 1 : 0;

                    switch(userObject.role) {
                        case 'Admin'   : userObject.role_id = 1; break;
                        case 'Intern'  : userObject.role_id = 2; break;
                        case 'Curator' : userObject.role_id = 3; break;
                        case 'Beta'    : userObject.role_id = 4; break;
                        case 'Retail'  : userObject.role_id = 5; break;
                        case 'Pending' : userObject.role_id = 6; break;
                    }

                    userObject.tickers = userObject.user_tickers = userObject.user_tickers.map(ticker => ticker.ticker);

                    return type === 'edit' ? saveUser(userObject) : addUser(userObject);
                };

                this.userTickerSearch = (ticker) => {
                    this.chooseTickersCtrl.tickerTyping(ticker);
                    this.showingTickerList = true;
                };

                this.closeTickersSearch = () => {
                    $scope.$emit("close.choose.tickerlist");
                    this.chooseTickerInput = '',
                    this.showingTickerList = false;
                };

                this.selectTicker = (ticker) => this.userObject.user_tickers.push(ticker);

                this.removeTicker = (ticker) => _.remove(this.userObject.user_tickers, { ticker: ticker.ticker });

                this.updateUser = (userObject) => {
                    anyErrors(userObject) ? displayErrors(userObject) : prepToSaveUser(userObject, this.modalType);
                };

                this.resetPassword = (userId) => {
                    ApiFactory.resetPassword(userId).then((data) => {
                        this.tempPassword  = data.password;
                        this.passwordReset = true;
                    });
                };

                this.removeUser = (userObj) => {
                    const destroyUserConfirmation = $uibModal.open({
                        controllerAs: 'duc',
                        bindToController: true,
                        templateUrl: 'users/view/user_remove_modal.html',
                        windowClass: 'tags-modal',
                        resolve: {
                            userObj: () => userObj
                        },
                        controller: function(userObj) {
                            this.destroyUser = () => {
                                userObj.active = 0;
                                ApiFactory.saveUser(userObj.id, userObj).then((data) => {
                                    UsersFactory.updateUsers(userObj);
                                    $rootScope.$emit("display.notification", userObj.firstname+' '+userObj.lastname+' removed!', 'success', 2000);
                                    this.$close();
                                });
                            };

                            this.cancel = () => this.$close();
                        }
                    });
                };

                this.cancel = () => this.$close();
            }
        });
    };

    const openAddUserModal = () => userModalParent(null, 'add');

    const openUserModal = (userObject) => userModalParent(userObject, 'edit');

    const removeUser = (user) => {
        user.active = 0;
        UsersFactory.updateUsers(user);
        $rootScope.$emit("display.notification", user.username+' removed!', 'success', 2000);
    };

    const loadUsers = (loadString, firstLoad) => {
        vm.usersLoaded = false;
        UsersFactory.initUsersDirect(loadString).then((userData) => {
            if (firstLoad) {
                vm.totalUsers = userData.total;
                if (vm.totalUsers < vm.end) {
                    vm.hidePagination = true;
                    vm.end = vm.totalUsers;
                } else {
                    vm.hidePagination = false;
                }

                calculatePages(vm.totalUsers);
            }
            
            displayUsersList(userData.list);
        });
    };

    ////////////////////////////////////////////////////////////////////////////
    loadUsers(loadString, true);

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.searchUsers      = searchUsers,
    vm.gotoPage         = gotoPage,
    vm.openAddUserModal = openAddUserModal,
    vm.openUserModal    = openUserModal,
    vm.removeUser       = removeUser;
}

module.exports = usersDirective;