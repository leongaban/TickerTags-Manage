module.exports = angular.module('constants_module')
	.constant('USER_ROLES', {
	    All      : '*',
	    Admin    : 'Admin',
	    Beta     : 'Beta',
	    Retail   : 'Retail',
	    Pending  : 'Pending',
	    UserFree : 'UserFree',
	    UserPaid : 'UserPaid',
	    Curator  : 'Curator'
	});