'use strict';

/**
 * @ngdoc function
 * @name Oss.controller:HomeController
 * @description
 * # HomeController
 */
angular.module('Oss')
  .controller('HomeController', function($scope, 
                                        $stateParams, 
                                        $ionicLoading, 
                                        $ionicPlatform, 
                                        $ionicPopup, 
                                        $ionicHistory, 
                                        $timeout, 
                                        $state, 
                                        LoginService,
                                        CategoryService,
                                        RegionService) {

    $scope.$on('$ionicView.beforeEnter', function() {
      //Hide unwanted nav items
      $scope.showTopArrow = false;
      $scope.$parent.isActiveTab('app.home');
      $scope.$parent.setIcon('logo');
      $scope.subnavHidden = true;

      $scope.$parent.currentUser = LoginService.getCurrentUser();

    });

    // Layout functions Part I - clear $ionicHistory and execute animation hooks on menu and navigation items (MVP)
    // Should be refactored to a directive, so as to provide modularity and legibility. (This is currently quite ugly)
    $ionicHistory.clearHistory();
    $scope.subnavHidden = true;
    $scope.categoriesHidden = true;


    

    $scope.$on('$ionicView.beforeEnter', function() {

      getDataFromBackend();
      
    });

    $scope.goToCategory = function(category) 
    {
      if ( category.identifier == 'all_category' )
      {
        // Go to market screen if all category
        $state.go('app.market', {category_id: category.id, subcategory: 0, action: 'buy'});
      }
      else {
        //Get sub categories by parent id from backend
        $ionicLoading.show({ template: 'Loading...'});
        CategoryService.getSubcategoryByParentID(category.id).then(
          function(response){
            $ionicLoading.hide();
            console.log('----- Success getting main categories -----');
            console.log(response.data);

            if (response.data.children.length > 0) {
              // Go to category screen if parent category
              $state.go('app.category', {category_id: category.id, subcategories: response.data.children});
            } else {
              // Go to market screen if sub category
              $state.go('app.market', {category_id: category.id, subcategory: category.id, action: 'buy'});
            }
          }, 
          function(response){
            $ionicLoading.hide();
            console.log('----- Failed getting main categories -----');
            console.log(response);
          });
      }
    }
    
    // Layout functions Part II
    $scope.$on('firstEntry', function() {
      $scope.$parent.navIcons.allHidden = false;
      $scope.$parent.toggleHomeIcons();
      $scope.subnavHidden = false;
      $scope.$parent.showHeader = true;
      $timeout(function() {
        $scope.categoriesHidden = false;
      }, 500)
    })


    //================= Get main/sub categories and regions/countries from api =======================
    function getDataFromBackend()
    {
      $scope.fetchCount = 0;

      $ionicLoading.show({ template: 'Loading'});

      // Get main categories
      CategoryService.getMainCategories().then(
        function(response){
          console.log('----- Success getting main categories -----');
          console.log(response.data);
          $scope.categories = response.data;
          $scope.$parent.categories = $scope.categories;
          checkCompleteGettingData();
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed getting main categories -----');
          console.log(response);
        });

      // Get sub categories
      CategoryService.getAllCategories().then(
        function(response){
          console.log('----- Success getting all categories -----');
          console.log(response.data);
          $scope.allcategories = response.data;
          $scope.$parent.allcategories = $scope.allcategories;
          checkCompleteGettingData();
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed getting all categories -----');
          console.log(response);
        });

      //Fetch all regions from backend
      RegionService.getAllRegions().then(
        function(regionsRes){
          console.log('----- Success getting all regions -----');
          console.log(regionsRes.data);
          $scope.regions = regionsRes.data;
          $scope.$parent.regions = $scope.regions;

          $scope.regions = regionsRes.data;

          for (var key in $scope.regions)
          {
            if (key == 'selected') {
              $scope.$parent.region_id = $scope.regions[key];
            }
          }
          checkCompleteGettingData();
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed getting all regions -----');
          console.log(response);
        });

      //Fetch all countries from backend
      RegionService.getAllCountries().then(
        function(countriesRes){
          console.log('----- Success getting all countries -----');
          console.log(countriesRes.data);
          $scope.countries = countriesRes.data;
          $scope.$parent.countries = $scope.countries;
          checkCompleteGettingData();
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed getting all countries -----');
          console.log(response);
        });
    }

    function checkCompleteGettingData()
    {
      $scope.fetchCount ++;
      if ($scope.fetchCount > 3) {
        $ionicLoading.hide();
      }
    }
  });
