
var app = angular.module("app", []);

app.factory("FoodsFactory", ['$http', '$q', function($http, $q) {
    var getFoods = $q.defer();

    // Check if parsed data is already available
    var data = localStorage.getItem("parsedFoods");

    if (data==null) {
        // Fetch data and parse
        console.info("No stored parsedFoods found");
        $http.get("resources/livsmedelsort.csv").then(function(response){
            $.csv.toObjects(response.data, {separator:";"}, function(err, data) {

                var parsedFoodsJson = angular.toJson(data);
                console.log("Length of parsedFoods", parsedFoodsJson.length);
                localStorage.setItem("parsedFoods", parsedFoodsJson);

                getFoods.resolve(data);

            });
        });
    } else {
        console.info("stored parsedFoods found");
        console.info("Length of parsedFoods %d", data.length);
        getFoods.resolve(angular.fromJson(data));
    }

    return getFoods.promise;
}]);

function FoodsController($scope, $timeout, FoodsFactory, $filter) {
    FoodsFactory.then(function(Foods) {
        $scope.Foods = Foods;
    });

    $scope.foodTableViewModel = new tableViewModel();
    $scope.personalFoodTableViewModel = new tableViewModel();

    $scope.searchBarKeypress = function($event) {
        $timeout(function() {
            if ($event.keyCode==40)
                $scope.foodTableViewModel.down();
            else if ($event.keyCode==38)
                $scope.foodTableViewModel.up();
        })
    }

    $scope.changeFilter = function() {
        $timeout(function() {
            // Filtering in controller instead of view
            filteredFoods = $filter('filter')($scope.Foods, {Livsmedelsnamn:$scope.searchText});
            filteredFoods = $filter('limitTo')(filteredFoods, 30);

            $scope.foodTableViewModel.setData(filteredFoods);
        });
    }

    $scope.addFoodToList = function($event) {
        console.log("Triggered");
        if ($event.keyCode == 13 && (Food=$scope.foodTableViewModel.getSelectedRow())) {
            $scope.personalFoodTableViewModel.data.push(Food);
        }
    }
}


function tableViewModel() {
    this.index=0;
    this.rowCount=0;
    this.data = [];

    tableViewModel.prototype.up = function() {
        if (this.index>0)
            this.index--;
    }
    tableViewModel.prototype.down = function() {
        if (this.index<this.rowCount)
            this.index++;
    }
    tableViewModel.prototype.getIndex = function() {
        return this.index;
    }
    tableViewModel.prototype.reset = function () {
        this.index = 0;
    }

    tableViewModel.prototype.setData = function (data) {
        this.data = data;
        this.rowCount = data.length-1;
        this.reset();
    }

    tableViewModel.prototype.isRowSelected = function(rowIndex) {
        return (this.index == rowIndex);
    }

    tableViewModel.prototype.getSelectedRow = function() {
        if (this.data.length>0)
            return this.data[this.index];
        else
            return null;
    }
}

function tableModel() {
    this.data = [];

}