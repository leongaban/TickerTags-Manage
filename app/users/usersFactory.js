////////////////////////////////////////////////////////////////////////////////
/**
 * @name UsersFactory
 * @namespace Factories
 * @desc Service to GET and handle Users
 */

var usersFactory = angular
    .module('usersFactory', [])
    .factory('UsersFactory', factory);

factory.$inject = [
    'ApiFactory'];

function factory(
    ApiFactory) {

    /** UsersFactory scope */
    /** --------------------------------------------------------------------- */
    var vm = {};
    var usersFactory = {
        storeMe         : storeMe,
        getMe           : getMe,
        initUsersDirect : initUsersDirect,
        updateUsers     : updateUsers,
        returnUsers     : returnUsers
    }

    return usersFactory;
    ////////////////////////////////////////////////////////////////////////////

    function storeMe(user) {
        vm.user = user;
        return vm.user;
    }

    function getMe() {
        return vm.user;
    }

    function initUsersDirect(loadString) {
        return ApiFactory.getUsers(loadString).then(function(res) {
            return setupUsersModel(res);
        });
    }

    function setupUsersModel(res) {
        vm.usersList = res.users;
        for (var i=0; i<vm.usersList.length; i++) {
            vm.usersList[i].role = convertRole(vm.usersList[i].role_id);
        }

        function convertRole(role_id) {
            switch(role_id) {
                case 1: return 'Admin';   break;
                case 2: return 'Intern';  break;
                case 3: return 'Curator'; break;
                case 4: return 'Beta';    break;
                case 5: return 'Retail';  break;
                case 6: return 'Pending'; break;
            }
        }

        vm.usersObject = {
            list  : vm.usersList,
            total : res.users_count
        }

        return vm.usersObject;
    }

    function updateUsers(updatedUser) {
        for (var i=0; i<vm.usersList.length; i++) {
            if (updatedUser.id === vm.usersList[i].id) {
                if (updatedUser.active === 1) {
                    vm.usersList[i] = updatedUser;
                }
                else if (updatedUser.active === 0) {
                    vm.usersList.splice(i, 1);
                }
            }
        }
    }

    function returnUsers() {
        return vm.usersList;
    }
}

module.exports = usersFactory;