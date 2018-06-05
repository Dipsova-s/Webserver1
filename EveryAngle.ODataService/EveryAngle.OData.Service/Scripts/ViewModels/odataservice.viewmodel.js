angular.module('odataService', [])
    .controller('', ['$scope', '$http', function ($scope, $http) { 

        $scope.serviceIsAvailable = false;
        $scope.checkServiceStatus = function () {
            
            $http.get(api_destination + '/metadata').then(function (response) {
                $scope.serviceIsAvailable = !response.data.available;
            });
        };
        $scope.checkServiceStatus();
    }]);