'use strict';

/**
 * @ngdoc function
 * @name Oss.controller:MessageController
 * @description
 * # MessageController
 */
angular.module('Oss')
  .controller('MessageController', function($scope, 
                                            $state, 
                                            $stateParams, 
                                            $ionicPopup, 
                                            $ionicModal,
                                            $ionicLoading,
                                            $ionicScrollDelegate, 
                                            $ionicTabsDelegate, 
                                            $timeout,
                                            MessagingService,
                                            AlertService, 
                                            OfferService,
                                            ProductService,
                                            LoginService,
                                            NotificationService,
                                            CONSTANTS) {

    $scope.$on('$ionicView.beforeEnter', function() {
      //Hide unwanted nav items
      $scope.showTopArrow = false;
      $scope.$parent.isActiveTab('app.messaging');
      $scope.$parent.setIcon('messages');

      $scope.channels = [];

      MessagingService.user.login('testuser', 'testuser', '341645e95a519d1c42b4c525dffae566d89bbc1d')
        //Login
        .then(function(data) {
          console.log(data);
          return MessagingService.channel.list();
        })
        //List channels
        .then(function(data) {
          console.log(data);
          $scope.channels = data.channels.map(function(x) {
            return {
              title: x.channel.name,
              lastMessage: x.last_message.message,
              unreadMessages: x.unread_message_count > 0,
              url: x.channel.channel_url
            }
          });
        })
        .catch(function(error) {
          console.log(error);
        });

      // Tab selection and buy/sell workflow for MVP
      // To be scrapped - let's find a better way to do this
      // if ($stateParams.tab === 'alerts')
      // {
      //   $ionicTabsDelegate.select(1);
      //   $scope.alerts[0].status = 'complete';
      // }

      // if ($scope.$parent.buy_flow === 1)
      // {
      //   $scope.alerts[0].status = 'approval';
      // }

      // if ($scope.$parent.buy_flow === 2)
      // {
      //   $scope.alerts[0].status = 'approved';
      // }

      $scope.currentUser = $scope.$parent.currentUser;

      // Get all alerts from backend
      getAllAlerts();
      
    });

    

    // This functionality is not wanted by the client.
    // Instead, they would like for the top tab-nav to be fixed position while the user scrolls down.
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

// <<<<<<< HEAD
//     $scope.viewMessage = function(message) {
//       $state.go('app.convo', {message: message});
//     };
// =======
    $scope.viewChannel = function(channel) {
      $state.go('app.convo', {channel: channel});
    }

    $scope.viewItemDescription = function(item, id) {
      if (typeof item !== 'undefined' && item !== 'null') {
        $state.go('app.itemDescription', {  item: item })
      }
    };

    $scope.approveOffer = function(userType) {

      // Approve or confirm offer
      $ionicLoading.show({ template: 'Loading...'});
      OfferService.approveOffer($scope.alert.type_id).then(
        function(response){
          $ionicLoading.hide();
          console.log('----- Success approving or confirming '+userType+'  offer -----');
          console.log(response.data);
          $scope.modal.hide();

          $ionicPopup.show({
            template: 'Your request has been sent successfully!',
            cssClass: 'confirm-popup',
            title: 'Thank You',
            scope: $scope,
            buttons: [
              {
                text: 'OK',
                onTap: function(e) { 
                  // Send approve offer notification
                  NotificationService.sendNotification($scope.opponent_id, 'approved_offer', $scope.notification_message);
                  getAllAlerts();
                }
              }
            ]
          });
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed approving or confirming'+userType+'  offer -----');
          console.log(response);
        });
    };

    $scope.denyOffer = function(userType) {

      if ($scope.isBuyer){
        $scope.modal.hide();
        return;
      }

      // deny offer
      $ionicLoading.show({ template: 'Loading...'});
      OfferService.denyOffer($scope.alert.type_id).then(
        function(response){
          $ionicLoading.hide();
          console.log('----- Success deny '+userType+' offer -----');
          console.log(response.data);
          $scope.modal.hide();

          $ionicPopup.show({
            template: 'Your request has been sent successfully!',
            cssClass: 'confirm-popup',
            title: 'Thank You',
            scope: $scope,
            buttons: [
              {
                text: 'OK',
                onTap: function(e) { 
                  // Send deny offer notification
                  NotificationService.sendNotification($scope.opponent_id, 'denied_offer', 'Your offer has been denied.');
                  getAllAlerts();
                }
              }
            ]
          });
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed deny '+userType+' offer -----');
          console.log(response);
        });
    };

    $scope.goToConvo = function(user_id) {
      $scope.modal.hide();
      $state.go('app.convo', {message: user_id});
    };
    $scope.goToItemDescription = function(item) {
      $scope.modal.hide();
      if (typeof item !== 'undefined' && item !== 'null') {
        $state.go('app.itemDescription', { id: item.category.parent_id==1 ? item.category_id : item.category.parent_id, item: item, action: item.type });
      }
    };

    $scope.read_class = function(flag) {

      if (flag)
        return 'read';
      else
        return 'unread';

    };

    /*  Pending Offer STUFF */
    $ionicModal.fromTemplateUrl('templates/modal/pendingOfferModal.html', {
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
        getAllAlerts();
      }
    }

    function getAllAlerts()
    {
      $ionicLoading.show({ template: 'Loading...'});
      AlertService.getAllAlerts().then(
        function(response){
          $ionicLoading.hide();
          console.log('----- Success getting all alerts -----');
          console.log(response.data);
          $scope.alerts = response.data;
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed getting all alerts -----');
          console.log(response);
        });
    }

    $scope.viewAlert = function(index) {

      var selectedItem = $scope.alerts[index];
      $scope.alert = $scope.alerts[index];
      
      $ionicLoading.show({ template: 'Loading...'});

      if ($scope.alert.seen == 0) {
        // Set alert as seen
        AlertService.setAlertAsSeen($scope.alert.id).then(
          function(response){
            console.log('----- Success set alert as seen -----');
            console.log(response.data);
            if ($scope.alert.type == CONSTANTS.OFFER_TYPE.OFFER) {
              viewOffer($scope.alert.type_id);
            } else if($scope.alert.type == CONSTANTS.OFFER_TYPE.TRANSACTION) {
              viewTransaction($scope.alert.type_id);
            }
          }, 
          function(response){
            $ionicLoading.hide();
            console.log('----- Failed set alert as seen -----');
            console.log(response);
          });
      } else {
        if ($scope.alert.type == CONSTANTS.OFFER_TYPE.OFFER) {
          viewOffer($scope.alert.type_id);
        } else if($scope.alert.type == CONSTANTS.OFFER_TYPE.TRANSACTION) {
          viewTransaction($scope.alert.type_id);
        }
      }
      

      

      //$scope.modal.show();

      // if ($scope.alerts[index].status == 'complete')
      // {
      //   $state.go('app.home');
      //   $timeout(function() {
      //     var alertPopup = $ionicPopup.show({
      //      title: 'Success',
      //      template: 'Your item: 75M - 14790 BHP - Anchor Handeling Tug Supply Vessel has been confirmed'
      //    });
      //   },2000);
      // }
      // else if ($scope.alerts[index].status == 'approval')
      // {
      //   $state.go('app.home');
      //   $timeout(function() {
      //     var alertPopup = $ionicPopup.show({
      //       title: 'Success',
      //       template: 'Your item: 75M - 14790 BHP - Anchor Handeling Tug Supply Vessel has been approved',
      //       buttons: [
      //         {
      //           text: 'Continue',
      //           onTap: function(e) {
      //             $state.go('app.messages');
      //             $timeout(function() {
      //               $ionicTabsDelegate.select(0);
      //             }, 0)
      //           }
      //         }
      //       ]
      //     })
      //   },2000);
      // }
      // else
      // {
      //   $ionicTabsDelegate.select(0);
      // }

    };

    function viewOffer(offer_id) 
    {
      // Get offer detail for getting product_id
      OfferService.getOfferDetail(offer_id).then(
        function(response){
          console.log('----- Success getting offer detail -----');
          console.log(response.data);
          
          $scope.offer = response.data;
          $scope.isBuyer = response.data.user_id == $scope.currentUser.id ? true : false;
          $scope.opponent_id = $scope.isBuyer ? response.data.product.user_id : response.data.user.id;
          $scope.notification_message = $scope.isBuyer ? 'Your offer has been confirmed.' : 'Your offer has been approved.';

          $scope.notification_key = $scope.isBuyer ? response.data.enable_user : 'approved_offer';
          
          // Get product detail
          ProductService.getProductByID(response.data.product_id).then(
            function(res){
              $ionicLoading.hide();
              console.log('----- Success getting product detail -----');
              console.log(res.data);

              var products = [];
              products.push(res.data);
              $scope.products = ProductService.convertToUIData(products, $scope.$parent.categories);

              $scope.opponent_identifier = $scope.isBuyer ? res.data.user.identifier : response.data.user.identifier;
              
              $scope.modal.show();
            }, 
            function(response){
              $ionicLoading.hide();
              console.log('----- Failed getting product detail -----');
              console.log(response);
            });
        }, 
        function(response){
          $ionicLoading.hide();
          console.log('----- Failed getting offer detail -----');
          console.log(response);
        });
    }

    function viewTransaction(transaction_id)
    {
      $ionicLoading.hide();
      $state.go('app.ongoing');
    }

    /*$scope.messages = [
      {
        title: '5843744569-TT',
        contents: [{ 's': 0, 'm': 'Please send certificates for review. I would like to purchase all 1000 Joints once we have this inspected by Offshore ...'}],
        read: false
      },
      {
        title: '4440342190-TT',
        contents: [{ 's': 0, 'm': 'I have 2 8x24 baskets that need to be picked up offshore xxxxxxx platform. I will therefore would like to take just 2 days...'}],
        read: true,
      },
      {
        title: '2201144509-TT',
        contents: [{ 's': 0, 'm': 'I am interested in this vessel as a standby for 2 days can you please attached contract for review'}],
        read: true,
      },
      {
        title: '1992356558-TT',
        contents: [{ 's': 0, 'm': 'I am interest in 8 out the 10 seats. Can you advise if this rate will be apportioned? Please atatched contract for review...'}],
        read: true,
      },
      {
        title: '4491234901-TT',
        contents: [{ 's': 0, 'm': 'Please send certificates for review. I would like to purchase all 1000 Joints once we have this inspected by Offshore ...'}],
        read: true,
      },
      {
        title: '1120984827-TT',
        contents: [{ 's': 0, 'm': 'I have a load out scheduled the 12th April at Chaguaramas. Will confirm on the application and will be in touch to ...'}],
        read: true,
      }
    ]*/

  });
