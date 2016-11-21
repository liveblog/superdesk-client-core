var render = function(element, value) {
    element.toggleClass('checked', !!value);
    element.attr('checked', !!value);
};

export default angular.module('superdesk.core.directives.check', [])
    /**
     * @ngdoc directive
     * @module superdesk.core.directives
     * @name sdCheck
     * @param {Boolean} ngModel model for checkbox value
     * @description Creates a custom-styled checkbox.
     */
    .directive('sdCheck', function() {
        return {
            require: 'ngModel',
            replace: true,
            transclude: true,
            template: '<span class="sd-checkbox" ng-transclude></span>',
            link: function($scope, element, attrs, ngModel) {
                ngModel.$render = function() {
                    render(element, ngModel.$viewValue);
                };

                $scope.$watch(attrs.ngModel, function() {
                    render(element, ngModel.$viewValue);
                });

                element.on('click', function(e) {
                    $scope.$apply(function() {
                        ngModel.$setViewValue(!ngModel.$viewValue);
                    });

                    return false;
                });
            }
        };
    });