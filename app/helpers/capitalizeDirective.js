////////////////////////////////////////////////////////////////////////////////
/**
 * @name capitalizeDirective 
 * @namespace Directive
 * @desc AutoMagically capitalizes inputs
 */

// http://stackoverflow.com/questions/16388562/angularjs-force-uppercase-in-textbox
var capitalizeDirective = angular
    .module('capitalizeDirective', [])
    .directive('capitalize', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                var capitalize = function(inputValue) {
                    if (inputValue == undefined) inputValue = '';
                    var capitalized = inputValue.toUpperCase();
                    if (capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }         
                    return capitalized;
                }
                modelCtrl.$parsers.push(capitalize);
                capitalize(scope[attrs.ngModel]);
            }
        };
    });

module.exports = capitalizeDirective;