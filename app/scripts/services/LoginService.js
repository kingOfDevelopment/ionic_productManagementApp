'use strict';

/**
 * @ngdoc function
 * @name Oss.service:LoginService
 * @description
 * # LoginService
 */

 angular.module('Oss')
    .service('LoginService', function($http, $timeout, $q, ApiService, CONSTANTS, MessagingService) {

      var currentUser = null;

      var _endpoint = ApiService.getEndpoint();

      //Login
      var Login = function(user, pass) {
        //http://ossapi.dev.kpd-i.com/api/v1/user/login
        var _url = ApiService.getEndpoint() + CONSTANTS.API_LOGIN;
        return $http({
          url: _url,
          params: {
            username: user,
            password: pass
          },
          method: 'POST'
        })
        .success(function(data) {
          currentUser = data;
          return data;
        })
        .error(function(data) {
          return data;
        })
      }

      //Logout
      var Logout = function(user, pass) {
        //http://ossapi.dev.kpd-i.com/api/v1/user/logout
        var _url = ApiService.getEndpoint() + CONSTANTS.API_LOGOUT;
        return $http({
          url: _url,
          params: {
            _rest_token:      currentUser.session.rest_token,
          },
          method: 'POST'
        })
        .success(function(data) {
          currentUser = null;
          return data;
        })
        .error(function(data) {
          return data;
        })
      }

      //Get current user
      var getCurrentUser = function(){
        return currentUser;
      }

      //Get rest token of current user
      var getRestToken = function(){
        return currentUser.session.rest_token;
      }

      return {
        getRestToken:     getRestToken,
        getCurrentUser:   getCurrentUser,
        Login:            Login,
        Logout:           Logout
      }
    });
