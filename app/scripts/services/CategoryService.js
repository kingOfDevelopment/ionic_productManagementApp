'use strict';

/**
 * @ngdoc function
 * @name Oss.service:CategoryService
 * @description
 * # CategoryService
 */
angular.module('Oss')
  // use factory for services
  .factory('CategoryService', function($http, $timeout, $q, ApiService, CONSTANTS, LoginService) {

    //Get all categories with rest token
    var getAllCategories = function() {
      //http://ossapi.dev.kpd-i.com/api/v1/category
      var _url = ApiService.getEndpoint() + CONSTANTS.API_CATEGORY;
      return $http({
          url: _url,
          params: {
              _rest_token: LoginService.getRestToken()
          },
          method: 'GET'
        })
        .success(function(data) { 
        })
        .error(function(error) { 
        });
    };

    //Get all main categories with rest token
    var getMainCategories = function() {
      //http://ossapi.dev.kpd-i.com/api/v1/category/main
      var _url = ApiService.getEndpoint() + CONSTANTS.API_CATEGORY_MAIN;
      return $http({
          url: _url,
          params: {
              _rest_token: LoginService.getRestToken()
          },
          method: 'GET'
        })
        .success(function(data) { 
        })
        .error(function(error) { 
        });
    };

    //Get subcategory by parent_id
    var getSubcategoryByParentID = function(parent_id) {
      //http://ossapi.dev.kpd-i.com/api/v1/category/{parent_id}"
      var _url = ApiService.getEndpoint() + CONSTANTS.API_CATEGORY +'/'+ parent_id;
      return $http({
          url: _url,
          params: {
              _rest_token: LoginService.getRestToken()
          },
          method: 'GET'
        })
        .success(function(data) { 
        })
        .error(function(error) { 
        });
    };

    //Get category parent by id
    // var getCategoryByID = function(id) {
    //   //http://ossapi.dev.kpd-i.com/api/v1/category/{id}/parent"
    //   var _url = ApiService.getEndpoint() + CONSTANTS.API_CATEGORY + id;
    //   return $http({
    //       url: _url,
    //       params: {
    //           _rest_token: LoginService.getRestToken()
    //       },
    //       method: 'GET'
    //     })
    //     .success(function(data) { 

    //     })
    //     .error(function(error) { 

    //     })
    //     .catch(function(res) {
    //       if (res.status == 404) {
    //         console.log("You got a 404!");
    //         return {
    //           data: {
    //             error: 404
    //           }
    //         }
    //       }
    //     });
    // };

    // public api
    return {
      getAllCategories:         getAllCategories,
      getMainCategories:        getMainCategories,
      getSubcategoryByParentID: getSubcategoryByParentID
    };
  });
