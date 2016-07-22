'use strict';

/**
 * @ngdoc function
 * @name Oss.controller:OngoingController
 * @description
 * # OngoingController
 */

angular.module('Oss')
.controller('OngoingController', function($scope, 
                                          $state, 
                                          $ionicPopup, 
                                          $ionicPlatform, 
                                          $ionicScrollDelegate,
                                          CONSTANTS) {

 
  $scope.$on('$ionicView.beforeEnter', function() {
    //Hide unwanted nav items
    $scope.showTopArrow = false;
    $scope.$parent.isActiveTab('app.ongoing');
    $scope.$parent.setIcon('ongoing');
  });

  // This functionality is not wanted by the client.
  // Instead, they would like for the top tab-nav to be fixed position while the user scrolls down.
  $scope.getScrollPosition = function(){
    var pos = $ionicScrollDelegate.getScrollPosition().top;
    if (pos >= 120) { $scope.$apply(function() {
      $scope.showTopArrow = true;
    }) }
    else { $scope.$apply(function() {
      $scope.showTopArrow = false;
    })  }
  }

  $scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop(true);
  }

  // To be pulled dynamically from the API
  $scope.ongoingItems = [
    {
      itemId: "918299",
      userId: "1120039201-TT",
      title: "100 meter berth availble Trinidad Galeota 5 days",
      shortDescription: "100 meter berth availble Trinidad Galeota 5 days 11th April to April 15th (See attached file for additional port charges)",
      category: "Shore Base",
      region: "North A.",
      price: "10,000.00",
      started: "04-26-16",
      ending: "04-29-16"
    }
  ];
  $scope.upcomingItems = [
    {
      id: "443399",
      title: "78 meter DP2 Anchor Handler (Built 2010) April 27th 10 days Brazil Port of Rio De Janerio",
      shortDescription: "DP2 2010 built Tugger winch: 1 x Hydrakraft 15T, 1 x Hydrakraft 20T, Reduced to 2 x 10T Crane 1: 1 x Pallfinger Marine",
      category: "VESSEL",
      price: "150,000.00",
      region: "North A.",
      starting: "04-27-16"
    }
  ];



  $scope.viewOngoing = function() {
    // Can probably be offloaded to a separate modal/popup service
    var myPopup = $ionicPopup.show({
       template: CONSTANTS.MODEL_RATING,
       title: 'Job Completed',
       cssClass: 'ratingspopup',
       subTitle: 'This job period has ended, please rate your buyers/seller.',
       scope: $scope,
       buttons: [
          {
            text: 'Submit',
            onTap: function(e) { 
              // Submit rating to server
              alert($scope.rating);
            }
          }
        ]
    });
  }

  $scope.viewUpcoming = function(){

  }

  $scope.rating = 5;
  $scope.rateFunction = function(rating)
  {
    $scope.rating = rating;
  }

})

.directive('starRating',
  function() {
    return {
      restrict : 'A',
      template : '<ul class="rating">'
           + '  <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">'
           + '\u2605'
           + '</li>'
           + '</ul>',
      scope : {
        ratingValue : '=',
        max : '=',
        onRatingSelected : '&'
      },
      link : function(scope, elem, attrs) {
        var updateStars = function() {
          scope.stars = [];
          for ( var i = 0; i < scope.max; i++) {
            scope.stars.push({
              filled : i < scope.ratingValue
            });
          }
        };
        
        scope.toggle = function(index) {
          scope.ratingValue = index + 1;
          scope.onRatingSelected({
            rating : index + 1
          });
        };
        
        scope.$watch('ratingValue',
          function(oldVal, newVal) {
            if (newVal) {
              updateStars();
            }
          }
        );
      }
    };
  }
);
