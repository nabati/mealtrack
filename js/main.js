var app = angular.module("app", []);

app.factory("FoodsFactory", ['$http', '$q', function ($http, $q) {
    var getFoods = $q.defer();

    // Check if parsed data is already available
    var foodsJson = localStorage.getItem("foodsJson");

     if (foodsJson==null) {
        // Fetch data and parse
        console.info("No stored parsedFoods found");
        $http.get("resources/livsmedelsort.csv").then(function (response) {
            $.csv.toObjects(response.data, {separator: ";"}, function (err, data) {
                var Foods = [];
                // TODO: Optimize parsing here
                angular.forEach(data, function (value, key) {
                    Foods.push(
                        new Food(
                            value["Livsmedelsnamn"],
                            100,
                            parseFloat(value["Energi (kcal)(kcal)"]),
                            parseFloat(value["Protein(g)"]),
                            parseFloat(value["Fett(g)"]),
                            parseFloat(value["Kolhydrater(g)"])
                        )
                    );
                });

                foodsJson = angular.toJson(Foods);
                console.log("Length of foodsJson", foodsJson.length);
                localStorage.setItem("foodsJson", foodsJson);
                getFoods.resolve(Foods);

            });
        });
    } else {
        console.info("stored parsedFoods found");
        console.info("Length of parsedFoods %d", foodsJson.length);
        getFoods.resolve(angular.fromJson(foodsJson));
    }

    return getFoods.promise;
}]);

function Food(name, weight, kcal, protein, fat, carbs) {
    this.name = name;
    this.weight = weight;
    this.kcal = kcal;
    this.protein = protein;
    this.fat = fat;
    this.carbs = carbs;
}

function FoodsController($scope, $timeout, FoodsFactory, $filter) {
    FoodsFactory.then(function (Foods) {
        $scope.Foods = Foods;
    });

    $scope.foodTableViewModel = new TableViewModel(new TableModel());
    $scope.personalFoodTableViewModel = new TableViewModel(new TableModel());

    $scope.searchBarKeypress = function ($event) {
        $timeout(function () {
            if ($event.keyCode == 40)
                $scope.foodTableViewModel.down();
            else if ($event.keyCode == 38)
                $scope.foodTableViewModel.up();
        })
    }

    $scope.changeFilter = function () {
        $timeout(function () {
            // Filtering in controller instead of view
            filteredFoods = $filter('filter')($scope.Foods, {name: $scope.searchText});
            filteredFoods = $filter('limitTo')(filteredFoods, 30);

            $scope.foodTableViewModel.setData(filteredFoods);
        });
    }

    $scope.addFoodToList = function () {
        if ((Food = $scope.foodTableViewModel.getSelectedRow())
            && (weight = parseInt($scope.weight))) {

            FoodCopy = angular.copy(Food);
            changeWeight(FoodCopy, weight);
            $scope.personalFoodTableViewModel.tableModel.data.push(FoodCopy);
            $scope.searchText = "";
            $scope.weight = "";
            $scope.giveSearchBarFocus=true;
        }
    }
}

function changeWeight(Food, newWeight) {
    var multiplier = (newWeight / (Food.weight));
    Food.weight = newWeight;
    Food.kcal *= multiplier;
    Food.protein *= multiplier;
    Food.fat *= multiplier;
    Food.carbs *= multiplier;
}


function TableViewModel(tableModel) {
    this.index = 0;
    this.rowCount = 0;
    this.data = [];
    this.tableModel = tableModel;

    TableViewModel.prototype.getModel = function () {
        return this.tableModel;
    }

    TableViewModel.prototype.up = function () {
        if (this.index > 0)
            this.index--;
    }
    TableViewModel.prototype.down = function () {
        if (this.index < this.rowCount)
            this.index++;
    }
    TableViewModel.prototype.getIndex = function () {
        return this.index;
    }
    TableViewModel.prototype.reset = function () {
        this.index = 0;
    }

    TableViewModel.prototype.setData = function (data) {
        this.getModel().setData(data);
        this.rowCount = data.length - 1;
        this.reset();
    }

    TableViewModel.prototype.isRowSelected = function (rowIndex) {
        return (this.index == rowIndex);
    }

    TableViewModel.prototype.getSelectedRow = function () {
        if (this.getModel().data.length > 0)
            return this.getModel().data[this.index];
        else
            return null;
    }
}

function TableModel() {
    this.data = [];

    TableModel.prototype.columnSum = function (columnIndex) {
        columnSum = 0;
        angular.forEach(this.data, function (value, key) {
            columnSum += value[columnIndex];
        });
        asdas
        return columnSum;
    }

    TableModel.prototype.setData = function (data) {
        this.data = data;
    }

    TableModel.prototype.getColumnSum = function (propertyName) {
        columnSum = 0;
        angular.forEach(this.data, function (value, key) {
            columnSum += parseFloat(value[propertyName]);
        });
        return columnSum;
    }
}

// TODO: Review snippet
app.directive('mtFocus', function() {
    return function($scope, element, attrs) {
        $scope.$watch(attrs.mtFocus,
        function(newValue) {
            newValue && element.focus();
            $scope.giveSearchBarFocus=false;
        }, true);
    };
})