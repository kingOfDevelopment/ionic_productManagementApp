'use strict';

/**
 * @ngdoc function
 * @name Oss.service:NotificationService
 * @description
 * # NotificationService
 */
angular.module('Oss')
  // use factory for services
  .factory('NotificationService', function($http, $timeout, $q, ApiService, CONSTANTS, LoginService, CategoryService, NOTIFICATION_API) {

    //Get settings
    var getSettings = function() {
      //http://ossapi.dev.kpd-i.com/api/v1/notificationsettings"
      var _url = ApiService.getEndpoint() + CONSTANTS.API_NOTIFICATION;
      return $http({
          url: _url,
          params: {
              _rest_token:      LoginService.getRestToken()
          },
          method: 'GET'
        })
        .success(function(data) { 
        })
        .error(function(error) { 
        });
    };

    //Get settings
    var setSettings = function(identifier) {
      //http://ossapi.dev.kpd-i.com/api/v1/notificationsettings/{identifier}"
      var _url = ApiService.getEndpoint() + CONSTANTS.API_NOTIFICATION +'/'+ identifier;
      return $http({
          url: _url,
          params: {
              _rest_token:      LoginService.getRestToken(),
          },
          method: 'GET'
        })
        .success(function(data) { 
        })
        .error(function(error) { 
        });
    };

    //Send
    var sendNotification = function(user_id, n_type, n_message){
      var _url = NOTIFICATION_API.host;
      return $http({
          url: _url,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'en-US',
            'Authorization': NOTIFICATION_API.api_token
          },
          data: {
              app_id:      '6017fb99-0c6e-4fd0-a8d9-e61db7e81aa2',
              contents: { 'en': n_message},
              tags: [
                        {"key": "uid", "relation": "=", "value": user_id},
                        {"key": n_type, "relation": "=","value": "1"}
                    ]
          },
          
        })
        .success(function(data) { 
        })
        .error(function(error) { 
        });
    }

    //Send tag
    var sendTag = function(identifier, value){

      var nValue = value == true ? 1 : 0;

      if (window.plugins != null) 
        window.plugins.OneSignal.sendTag(identifier, value);
    }

    //Send tags
    var sendTags = function(){

      this.getSettings().then(
        function(response){
          console.log('----- Success set notification settings -----');
          console.log(response.data);

          var tagData = {};

          for (var i = response.data.length - 1; i >= 0; i--) {
            var notification = response.data[i];
            tagData[notification.notification_type.identifier] = notification.allowed == true ? 1 : 0;
          }
          tagData['uid'] = LoginService.getCurrentUser().id;

          if (window.plugins != null) 
            window.plugins.OneSignal.sendTags(tagData);
        }, 
        function(response){
          console.log('----- Failed set notification settings -----');
          console.log(response);
        });
    }


    // public api
    return {
      getSettings:      getSettings,
      setSettings:      setSettings,
      sendNotification: sendNotification,
      sendTag:          sendTag,
      sendTags:         sendTags
    };
  });

