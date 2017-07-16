module.exports = angular
    .module('tagsModule')
.component('tagsBulkDelete', {
    templateUrl: 'tags/bulk/delete.html',
    controller: BulkDeleteController,
    bindings:{
        modalInstance: '<',
        resolve: '<',
        close: '&',
        dismiss: '&'
    }
})

function BulkDeleteController(){
}