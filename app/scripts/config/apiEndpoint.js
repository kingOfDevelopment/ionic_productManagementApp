'use strict';

/**
 * @ngdoc constant
 * @name Oss.API_ENDPOINT
 * @description
 * # API_ENDPOINT
 * Defines the API endpoint where our resources will make requests against.
 * Is used inside /services/ApiService.js to generate correct endpoint dynamically
 */


angular.module('Oss')

  // development
  .constant('API_ENDPOINT', {
    host:         'http://ossapi.dev.kpd-i.com',
    path:         '/api/v1/',
    needsAuth:    false
  })
  .constant('CHAT_API', {
    host:         'https://api.sendbird.com/',
    app_id:       '8537AAA2-F108-4459-8A0C-AB896C4F4BAE',
    api_token:    'fbb69bacd202acc81bc5aaa4eb15ede3ae32b3f3'
  })
  .constant('NOTIFICATION_API', {
    host:         'https://onesignal.com/api/v1/notifications',
    app_id:       '6017fb99-0c6e-4fd0-a8d9-e61db7e81aa2',
    api_token:    'Basic ZTI3NjI5YjktMjBlNC00MWEzLWE4ZWItMmM2NDA1N2QyNDQy'
  })


  // live example with HTTP Basic Auth

  /*.constant('API_ENDPOINT', {
    host: 'http://ossapi.dev.kpd-i.com',
    path: '/api/v1',
    needsAuth: true,
    username: '',
    password: ''
  });*/
