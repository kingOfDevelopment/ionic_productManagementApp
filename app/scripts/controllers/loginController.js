'use strict';

/**
 * @ngdoc function
 * @name Oss.controller:LoginController
 * @description
 * # LoginController
 */

angular.module('Oss')
.controller('LoginController', function($scope, 
                                        $rootScope,
                                        $state, 
                                        $timeout, 
                                        $stateParams, 
                                        $ionicPopup, 
                                        $ionicPlatform, 
                                        $ionicModal, 
                                        $ionicHistory, 
                                        $ionicLoading,
                                        LoginService,
                                        NotificationService) {

  // Layout functions, please refactor
  $scope.$on('$ionicView.beforeEnter', function() {

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();

    $scope.$parent.navIcons.allHidden = true;
    $scope.subnavHidden = true;
    $scope.$parent.showHeader = false;
  })

  $scope.platformReady = false;
  $ionicPlatform.ready(function() {
    $scope.platformReady = true;
  })
  $scope.creds = {
    user: null,
    pass: null
  }
  $scope.error = {
    username: false,
    password: false
  }
  $scope.reset = function() {
    $scope.error = {
      username: false,
      password: false
    }
  }

  // Everything below should be refactored into LoginService
  $scope.login = function(user, pass) {
    if (user == null || pass == null) 
    {
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
      })
      return;
    }

    $ionicLoading.show({ template: 'Loading...'});

    LoginService.Login(user, pass)
      .then(function(res) {

        $ionicLoading.hide();
        
        if (res.data.error) {
          switch (res.data.error) {
            case 200:
              $scope.error.password = true;
              break;
            case 404:
              $scope.error.username = true;
              break;
          }
        }
        else {
          NotificationService.sendTags();
          if (res.data.username == 'mpreed') $rootScope.currentUser = 'testuser';
          else if (res.data.username == 'kdionne') $rootScope.currentUser = 'testuser2';
          $scope.termsModal.show();
        }
      })
  }
  $scope.continue = function() {
    $scope.termsModal.hide();
    $state.go('app.home');
    $timeout(function() {
      $scope.$parent.$broadcast('firstEntry');
    }, 750);
  }
  $ionicModal.fromTemplateUrl('templates/modal/termsModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.termsModal = modal;
  });
  $scope.$on('$destroy', function() {
    $scope.termsModal.remove();
  });

})
