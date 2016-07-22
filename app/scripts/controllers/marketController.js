'use strict';

/**
 * @ngdoc function
 * @name Oss.controller:MarketController
 * @description
 * # MarketController
 */
angular.module('Oss')
  .controller('MarketController', function($scope, 
                                            $state, 
                                            $stateParams, 
                                            $ionicScrollDelegate, 
                                            $timeout, 
                                            $ionicLoading, 
                                            ProductService, 
                                            CONSTANTS) {

    // Layout functions, to be refactored
    $scope.showTopArrow = false;
    $scope.$parent.isActiveTab('app.messaging');

    $scope.categories = $scope.$parent.categories;

    $scope.category_id = $stateParams.category_id || '';
    $scope.subcategory = $stateParams.subcategory || '';

    //================= Get all product from backend =======================
    $scope.$on('$ionicView.beforeEnter', function() {

      $ionicLoading.show({ template: 'Loading...'});
      ProductService.getAllProducts().then(
        function(response){
          $ionicLoading.hide();
          console.log('----- Success getting all products -----');
          console.log(response.data);
          //$scope.convertDataForUI(response.data);
          $scope.products = ProductService.convertToUIData(response.data, $scope.categories);
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed getting all products -----');
          console.log(response);
        });
    });
    //========================================================================

    $scope.getScrollPosition = function(){
      var pos = $ionicScrollDelegate.getScrollPosition().top;
      if (pos >= 120) { $scope.$apply(function() {
        $scope.showTopArrow = true;
      }); }
      else { $scope.$apply(function() {
        $scope.showTopArrow = false;
      });  }
    };

    $scope.scrollTop = function() {
      $ionicScrollDelegate.scrollTop(true);
    };

    // Go to item description screen
    $scope.viewItemDescription = function(item, id, action) {
      console.log(id);
      if (typeof item !== 'undefined' && item !== 'null') {

        $state.go('app.itemDescription', { id: item.category.parent_id==1 ? item.category_id : item.category.parent_id, item: item, action: action });
      }
    }

  });
