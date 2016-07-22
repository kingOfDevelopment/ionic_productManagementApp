'use strict';

/**
 * @ngdoc function
 * @name Oss.controller:ConversationController
 * @description
 * # ConversationController
 */


angular.module('Oss')
  .controller('ConversationController', function($scope, 
                                                  $rootScope,
                                                  $sanitize,
                                                  $state, 
                                                  $stateParams, 
                                                  $ionicLoading,
                                                  $ionicSideMenuDelegate, 
                                                  $timeout,
                                                  ContractService,
                                                  MessagingService) {

    // Demo attachment vars - to be replaced with a proper AttachmentService post-MVP
    $scope.currentAttachment = {
      name: "Contract_Template_1.pdf"
    }
    $scope.attachmentSelected = false;

    $scope.$on('$ionicView.beforeEnter', function() {
      //Hide unwanted nav items
      $scope.$parent.isActiveTab('app.messaging');
      $scope.$parent.setIcon('messages');
      $scope.channel = $stateParams.channel || {};
      $scope.$parent.navTitle = $scope.channel.title || "Conversation";
      MessagingService.channel.join($scope.channel.url)
        .then(function(data) {
          console.log(data);
          $scope.convo = data.messages.map(function(x) {
            return {
              m: x.payload.message,
              s: ($rootScope.currentUser == x.payload.user.guest_id) ? 1 : 0
            }
          });
        })
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      //Reset nav items before leaving
      $scope.$parent.navIcons.allHidden = false;
      $scope.$parent.searchHidden = false;
      $scope.$parent.navTitle = "";
      $timeout(function() {
        $scope.$parent.currentIcon.hidden = false;
      }, 500)
    });

    // Menu functions - Left is messaging window, Right is attachment dialogue
    $scope.rightMenuClosed = function() {
      return $ionicSideMenuDelegate.isOpenRight()
    }

    $scope.openRight = function() 
    {
      $ionicLoading.show({ template: 'Loading'});
      // Get contracts
      ContractService.getContracts().then(
        function(response){
          $ionicLoading.hide();
          console.log('----- Success get contracts -----');
          console.log(response.data);

          $scope.contracts = response.data.children;

          $ionicSideMenuDelegate.toggleRight();
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed get contracts -----');
          console.log(response);
        });
    }

    // To be replaced with an AttachmentService ASAP
    $scope.addAttachment = function(att) {
      $scope.currentAttachment = att;
      $scope.attachmentSelected = true;
      $ionicSideMenuDelegate.toggleRight();

      // setTimeout(function() {

      //   if ($scope.$parent.buy_flow == 1)
      //   {
      //     $scope.$parent.buy_flow = 2;
      //   }

      //   $state.go('app.messages', { tab: 'alerts' });

      // }, 3000);
    }

    $scope.sendMessage = function(msg) {
      msg = $sanitize(msg);
      MessagingService.channel.send($scope.channel.url, $rootScope.currentUser, msg);
      $scope.messageContent = "";
    }

    // Determines which side the message is displayed on (sender or receiver) - should be replaced with MessagingService ASAP
    $scope.message_side = function(side)
    {
      if (side == 0)
        return 'left';
      else
        return 'right';
    }

  });
