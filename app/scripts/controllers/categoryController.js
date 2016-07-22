'use strict';

/**
 * @ngdoc function
 * @name Oss.controller:CategoryController
 * @description
 * # CategoryController
 */

angular.module('Oss')
.controller('CategoryController', function($scope, $state, $timeout, $stateParams) {

  // Categories and subcategories are currently passed in as stateParams from the previous screen (homepage)
  $scope.subcategories = ( $stateParams.subcategories || {});
  $scope.category_id = ( $stateParams.category_id || {});

  // Go to market screen
  $scope.goToMarket = function(subcategory_id) {
    $state.go('app.market', {category_id: $scope.category_id || "1", subcategory: subcategory_id || "", action: "buy"});
  }

});
