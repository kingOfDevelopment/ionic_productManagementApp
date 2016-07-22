'use strict';

/**
 * @ngdoc function
 * @name Oss.controller:PostController
 * @description
 * # PostController
 */
angular.module('Oss')
  .controller('PostController', function($scope, 
                                        $state, 
                                        $stateParams, 
                                        $ionicSideMenuDelegate, 
                                        $ionicPlatform, 
                                        $ionicPopup, 
                                        $ionicModal, 
                                        $ionicLoading, 
                                        $timeout, 
                                        ionicDatePicker, 
                                        ProductService, 
                                        RegionService, 
                                        CONSTANTS) {

    // Layout variable, to be refactored
    $scope.$parent.titleHidden = false;
    $scope.region_id = $scope.$parent.region_id;
    $scope.currentUser = $scope.$parent.currentUser;

    // MVP object for a single currentProduct - let's change this into a directive
    $scope.currentProduct = {
      title: null,
      type: CONSTANTS.POST_TYPE.NONE,
      sku: null,
      details: null,
      price: null,
      available_from: null,
      available_to: null,
      category_id: 2,
      sub_category_id: null,
      region_id: $scope.$parent.region_id,
      country_id: null,
      images: null,
      quantity: 0,
      seats: 0
    };

    $scope.categories = $scope.$parent.categories;

    $scope.categorySelection = '';
    $scope.hasSubCategory = true;


    // More layout functions, to be refactored
    $scope.$on('$ionicView.beforeEnter', function() {
      //Hide unwanted nav items
      $scope.$parent.navIcons.allHidden = true;
      $scope.$parent.searchHidden = true;
      $scope.$parent.navTitle = 'New Listing';

      $scope.regions = $scope.$parent.regions;
      $scope.region_id = $scope.$parent.region_id;
      $scope.currentProduct.region_id = $scope.$parent.region_id;
      $scope.countries = $scope.$parent.countries;
      
      $ionicModal.fromTemplateUrl('templates/modal/numpadModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      $scope.modal.remove();
      //Reset nav items before leaving
      $scope.$parent.navIcons.allHidden = false;
      $scope.$parent.searchHidden = false;
      $scope.$parent.navTitle = '';
      $timeout(function() {
        $scope.$parent.currentIcon.hidden = false;
      }, 500);
    });

    /*  FORM STUFF  */
    // Form needs a lot of work
    
    $scope.showDatePicker = function(range) {

      var pickerOptions = {
        from: new Date(),
        to: new Date(2050, 12, 31),
        inputDate: new Date(),
        setLabel: 'DONE',
        showTodayButton: false,
        closeLabel: 'CANCEL',
        mondayFirst: true,
        closeOnSelect: false,
        templateType: 'popup',

        callback: function (date) {
          if (range === 'from') { $scope.currentProduct.available_from = moment(date).format('DD/MM/YYYY');}
          else if (range === 'to') { $scope.currentProduct.available_to = moment(date).format('DD/MM/YYYY');};
          if ($scope.currentProduct.available_from !== null && $scope.currentProduct.available_to !== null) {
            var before = moment($scope.currentProduct.available_from, 'DD/MM/YYYY');
            var after = moment($scope.currentProduct.available_to, 'DD/MM/YYYY');
            $scope.currentProduct.days = after.diff(before, 'days');
          }
        }
      };

      ionicDatePicker.openDatePicker(pickerOptions);
    };

    $scope.showSelectPicker = function(type)
    {
      var template = '';
      var title = '';

      switch (type){
        case 'category':
          template = CONSTANTS.MODEL_CATEGORY_SELECTOR;
          title = 'Please select a category';
          break;
        case 'subcategory':
          template = CONSTANTS.MODEL_SUBCATEGORY_SELECTOR;
          title = 'Please select a sub category';
          break;
        case 'country':
          template = CONSTANTS.MODEL_COUNTRY_SELECTOR;
          title = 'Please select a country';
          break;
        case 'region':
          template = CONSTANTS.MODEL_REGION_SELECTOR;
          title = 'Please select a region';
          break;
        default:
          break;
      }
      $ionicPopup.show({
        template: template,
        cssClass: 'select-popup',
        title: title,
        scope: $scope,
        buttons: [
          {
            text: 'OK',
            onTap: function(e) { 
              if (type == 'region'){
                $scope.currentProduct.country_id = null;
              } if (type == 'category') {
                $scope.currentProduct.sub_category_id = null;
                $scope.currentProduct.seats = 0;
                $scope.currentProduct.quantity = 0;
                checkHasSubCategory();
              } if (type == 'subcategory') {
                $scope.isInvalidCategoryID = false;
                $scope.currentProduct.seats = 0;
                $scope.currentProduct.quantity = 0;
              }
            }
          }
        ]
      });
    };

    // Menu functions - Left is Forms, Right is Confirmation
    $scope.rightMenuClosed = function() {
      return $ionicSideMenuDelegate.isOpenRight();
    };

    function isOtherFieldsInvalid(){
      if (!$scope.currentProduct.type) { return true; }
      return false;
    }

    function checkHasSubCategory()
    {
      if ($scope.currentProduct.category_id == null) $scope.hasSubCategory = false;
      for (var i = $scope.allcategories.length - 1; i >= 0; i--) {
        if ($scope.allcategories[i].parent_id == $scope.currentProduct.category_id)
        {
          $scope.hasSubCategory = true;
          return;
        }
      }
      $scope.hasSubCategory = false;
    }

    function isInvalidCategoryID()
    {
      if ($scope.currentProduct.sub_category_id == null)
      {
        for (var i = $scope.allcategories.length - 1; i >= 0; i--) {
          if ($scope.allcategories[i].parent_id == $scope.currentProduct.category_id)
          {
            $scope.isInvalidCategoryID = true;
            return true;
          }
        }
      }
      $scope.isInvalidCategoryID = false;
      return false;
    }
    

    // Go to product preview page
    $scope.openRight = function(form) {
      // Checking valid datas of product form
      if ( isInvalidCategoryID() || isOtherFieldsInvalid() || (form && form.$invalid) ) {
        $ionicPopup.show({
          template: 'Please complete all fields correctly.',
          cssClass: 'invalid-popup',
          title: 'Invalid Input.',
          scope: $scope,
          buttons: [
            {
              text: 'OK',
              onTap: function(e) {
              }
            }
          ]
        });
        return;
      }

      for (var i = $scope.categories.length - 1; i >= 0; i--) {
        var mainCatetory = $scope.categories[i];
        if (mainCatetory.id == $scope.currentProduct.category_id) {
          $scope.imgPic = 'images' + mainCatetory.path + '.jpg';
        }
      }
      $ionicSideMenuDelegate.toggleRight();
      $scope.$parent.navTitle = "Listing Details";
    };

    /*  NUMPAD STUFF */
    // PIN will probably be scrubbed from first release
    $ionicModal.fromTemplateUrl('templates/modal/numpadModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    $scope.modalCommand = function(cmd) {
      if (typeof cmd !== 'string') { return; }
      else if (cmd === 'show') {
        $scope.modal.show();
      }
      else if (cmd ==='hide') {
        $scope.modal.hide();
      }
    }

    $scope.nums = new Array(10);
    $scope.numString = "";
    $scope.proceed = false;

    $scope.modifyPin = function(action, n) {
      if (action == 'add') {
        $scope.numString += n.toString();
      }
      else if (action == 'remove') {
        $scope.numString = $scope.numString.slice(0,$scope.numString.length-1);
        $scope.proceed = false;
      }
      if ($scope.numString.length == 4) {
        $scope.proceed = true;
      }
    }

    // To be offloaded to a currentProductService
    $scope.processListing = function() {

      $ionicLoading.show({ template: 'Loading'});
      // Create product
      ProductService.createProduct($scope.currentProduct).then(
        function(response){
          console.log('----- Success creating current product -----');
          console.log(response.data);

          var responseProduct = response.data;

          // Add onsale flag to current product
          ProductService.addFlagToProduct(responseProduct.id, CONSTANTS.FLAG_IDENTIFIERS.ONSALE).then(
            function(countriesRes){
              $ionicLoading.hide();
              console.log('----- Success adding onsale flag to current product -----');
              console.log(countriesRes.data);
              
              $scope.modal.hide().then(function() {
                $ionicPopup.show({
                  template: 'Your Listing has been created and successfully posted to the Marketplace.',
                  cssClass: 'thankYou-popup',
                  title: 'Thank You',
                  scope: $scope,
                  buttons: [
                    {
                      text: 'View Item',
                      onTap: function(e) {
                        $ionicSideMenuDelegate.toggleRight();
                        $scope.$parent.navTitle = "";
                        $scope.$parent.navIcons.allHidden = false;

                        $state.go('app.market', {category_id: 1, subcategory: 0, action: 'sell'});
                      }
                    },
                    {
                      text: 'Close',
                      onTap: function(e) {
                        $ionicSideMenuDelegate.toggleRight();
                        $scope.$parent.toggleHomeIcons();
                        $state.go('app.home');
                      }
                    }
                  ]
                });
              });
            }, 
            function(response){
              $ionicLoading.hide();
              console.log('----- Failed adding onsale flag to current product -----');
              console.log(response);
            });
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed creating current product -----');
          console.log(response);
        });
    };

  });
