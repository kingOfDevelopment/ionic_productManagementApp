'use strict';

/**
 * @ngdoc function
 * @name Oss.controller:ListingController
 * @description
 * # ListingController
 */

angular.module('Oss')
.controller('ListingController', function($scope, 
                                          $state, 
                                          $sce, 
                                          $ionicLoading, 
                                          $ionicHistory, 
                                          $ionicPopup, 
                                          $ionicTabsDelegate, 
                                          $timeout, 
                                          $stateParams, 
                                          OfferService, 
                                          ProductService, 
                                          NotificationService,
                                          CONSTANTS) {

  // Listing action is "Buy" or "Sell" - quick and dirty solution, should probably be a ListingService function
  $scope.listingAction = $stateParams.action || "";

  // More layout functions - please refactor
  $scope.$parent.titleHidden = false;
  $scope.$parent.searchHidden = true;

  $scope.currentUser = $scope.$parent.currentUser;

  $scope.categories = $scope.$parent.categories;

  $scope.item = $stateParams.item || {};
  $scope.category_id = $stateParams.id || {};
  console.log($scope.item);

  $scope.processListing = function(action) {

    $ionicLoading.show({ template: 'Loading'});
    // Create offer
    OfferService.createOffer($scope.item.id).then(
      
      function(response){
        $ionicLoading.hide();
        console.log('----- Success creating offer -----');
        console.log(response.data);

        if (action == 'Buy') {
          $scope.$parent.buy_flow = 1;

          $ionicPopup.show({
            template: 'Your request has been sent successfully!',
            cssClass: 'confirm-popup',
            title: 'Thank You',
            scope: $scope,
            buttons: [
              {
                text: 'Continue',
                onTap: function(e) {
                  sendNotification();
                  $scope.$parent.navIcons.allHidden = false;
                  $state.go('app.messages');
                  $timeout(function() {
                    $ionicTabsDelegate.select(1);
                  }, 0)
                }
              }
            ]
          });
        } else if (action == 'Sell') {
          $ionicPopup.show({
            template: 'Your request has been sent successfully!',
            cssClass: 'confirm-popup',
            title: 'Thank You',
            scope: $scope,
            buttons: [
              {
                text: 'View Market',
                onTap: function(e) {
                  sendNotification();
                  $scope.$parent.navIcons.allHidden = false;
                  $state.go('app.market', {category_id: 1, subcategory: 0, action: 'sell'});
                  //$state.go('app.market', {category_id: category.id, subcategory: 0, action: 'sell'});
                }
              }
            ]
          });
        }
      },function(response){
        $ionicLoading.hide();
        console.log('----- Failed creating offer -----');
        console.log(response);

        $ionicPopup.show({
          template: response.data.message,
          cssClass: 'thankYou-popup',
          title: 'Failed',
          scope: $scope,
          buttons: [
            {
              text: 'View Market',
              onTap: function(e) {
                $scope.$parent.navIcons.allHidden = false;
                $state.go('app.market', {category_id: 1, subcategory: 0, action: 'sell'});
                //$state.go('app.market', {category_id: category.id, subcategory: 0, action: 'sell'});
              }
            },
            {
              text: 'Close',
              onTap: function(e) {
                $scope.$parent.toggleHomeIcons();
                $state.go('app.home');
              }
            }
          ]
        });
      });
  }

  // Careful with this, it disables string sanitizing
  $scope.trustHtml = function(html) {
    return $sce.trustAsHtml(html);
  }

  // Should likely be part of some popup/modal service for the sake of legibility and continuity
  $scope.verifyListing = function() {
    var confirmPopup = $ionicPopup.confirm({
       title: 'Verify Certification',
       template: 'Would you like Offshore Sharing Solution to confirm that this item meets ISO Standards through a third party?'
    }).then(function() {

      var alertPopup = $ionicPopup.alert({
         title: 'Verification',
         template: 'Thank you for your request, we will contact you shortly.'
      }).then(function() {
        $state.go('app.ongoing');
      });
    });
  }

  // More layout functions, please refactor
  $timeout(function() {
    $scope.$parent.navTitle = "Listing Details";
  }, 1250)

  $scope.$on('$ionicView.beforeEnter', function() {
    //Hide unwanted nav items
    $scope.$parent.navIcons.allHidden = true;
    $scope.$parent.searchHidden = true;
  });

  $scope.$on('$ionicView.beforeLeave', function() {
    //Reset nav items before leaving
    $scope.$parent.navIcons.allHidden = false;
    $scope.$parent.currentIcon.hidden = false;
    $scope.$parent.searchHidden = false;
    $scope.$parent.navTitle = "";
  });


  function sendNotification(){
    NotificationService.sendNotification($scope.item.user.id, 'made_offer', $scope.currentUser.identifier.toUpperCase()+' has made an offer on your post.');
  }
})
