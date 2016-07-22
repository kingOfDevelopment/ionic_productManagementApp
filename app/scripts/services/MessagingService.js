'use strict';

/**
 * @ngdoc function
 * @name Oss.service:MessagingService
 * @description
 * # MessagingService
 */
angular.module('Oss')
  // use factory for services
  .factory('MessagingService', function($http, $timeout, $q, CHAT_API) {

    var _api = CHAT_API;
    var _app = {
      id: '8537AAA2-F108-4459-8A0C-AB896C4F4BAE'
    }

    //$http options creation method
    function getOpts(method, url, data) {
      return {
        method: method,
        url: _api.host + url || '',
        data: data
      }
    }

    var user = {
      loggedIn: false,
      //Create user in Sendbird DB
      create: function(user, id) {
        return $http(getOpts('POST', 'user/create', {
            auth: _api.api_token,
            id: id,
            nickname: user,
            issue_access_token: true
          })
        )
      },
      get: function(username, _issue_token) {
        return $http(getOpts('POST', 'user/auth', {
            auth: _api.api_token,
            id: username,
            issue_access_token: _issue_token
          })
        )
      },
      login: function(id, name, _access_token) {
        var deferred = $q.defer();
        sendbird.init({
          app_id: _app.id,
          guest_id: id,
          user_name: name,
          access_token: _access_token,
          successFunc: function(data) {
            deferred.resolve("Logged in successfully!");
            user.loggedIn = true;
          },
          errorFunc: function(status, error) {
            deferred.reject("Nope!");
          }
        })
        return deferred.promise;
      }
    }

    var channel = {
      create: function(userArray) {

        //Check that array is of right type and non-zero
        if (typeof userArray === 'object' && typeof userArray.length !== 'undefined' && userArray.length > 0) {
          // Create Chat messaging channel
          return $http(getOpts('POST', 'messaging/create', {
            auth: _api.api_token,
            name: 'test room',
            is_group: false
            })
          )
          .then(function(data) {
            if (data.error) { throw data.error; }
            else {
              console.log("Channel created!")
              return data;
            }
          })
          .then(function(data) {
            data = data.data;
            // Invite users to the channel
            return $http(getOpts('POST', 'messaging/invite', {
              auth: _api.api_token,
              channel_url: data.channel.channel_url,
              user_ids: userArray
              })
            )
          })
          .then(function(d) {
            d = d.data;
            if (d.error) { throw {error: d.error, message: d.message}; }
            else {
              console.log("Users invited to channel!")
              return d;
            }
          })
          .catch(function(error) {
            return error;
          })
        }
        // Array type or length error
        else {
          console.log({error: "Not an array"});
        }
      },
      list: function() {
        var deferred = $q.defer();
        if (user.loggedIn === true) {
          sendbird.getMessagingChannelListPagination({
            page: 1,
            limit: 20,
            successFunc: function(data) {
              deferred.resolve(data);
            },
            errorFunc: function(status, error) {
              deferred.reject(status, error);
            }
          })
        }
        else {
          throw {error: "User has not been authenticated in sendbird!"};
        }
        return deferred.promise;
      },
      view: function(_channel_url) {
        return $http(getOpts('POST', 'messaging/message_count', {
          auth: _api.api_token,
          channel_url: _channel_url
          })
        );
      },
      join: function(_channel_url) {
        var deferred = $q.defer();
        sendbird.joinMessagingChannel(
          _channel_url,
          {
            successFunc: function(data) {
              console.log("Joined channel successfully.");
              console.log(data);
              sendbird.getMessageLoadMore({
                limit: 20,
                successFunc: function(data) {
                  deferred.resolve(data);
                },
                errorFunc: function(status, error) {
                  deferred.reject(status, error);
                }
              })
            },
            errorFunc: function(status, error) {
              deferred.reject(status, error);
            }
          }
        )
        return deferred.promise;
      },
      send: function(_channel_url, id, message) {
        return $http(getOpts('POST', 'channel/send', {
          auth: _api.api_token,
          channel_url: _channel_url,
          id: id,
          message: message
          })
        )
      }
    }

    /*channel.view("sendbird_messaging_10472592_43af575e3dc04b4ef9c9ccda90cef8978728379c")
      .then(function(data) {
        console.log(data);
      })*/


    /*channel.create(['testuser', 'testuser2'])
      .then(function(data) {
        if (data.error) {
          console.log(data.message);
        }
        else console.log(data);
      })*/



    /*user.create('testuser2', '002')
      .success(function(data) {
        console.log(data);
      })*/

    /*user.get('testuser2', true)
      .then(function(data) {
        console.log(data.data)
      })*/

      //Send a message
      /*
      .then(function() {
        return channel.send('sendbird_messaging_10472592_43af575e3dc04b4ef9c9ccda90cef8978728379c', 'testuser', 'One more test message!')
      })
      .then(function(data) {
        console.log("Message sent.")
      })
      */

      //Join channel + get messages
      /*
      .then(function(data) {
        console.log("Message list:");
        var messages = data.messages.map(function(x) {
          var obj = {}
          return x.payload.user.guest_id + ": " + x.payload.message;
        });
        messages.forEach(function(value) {
          console.log(value);
        })
      })
      */

      //testuser2
      /*
      sendbird.init({
        app_id: _app.id,
        guest_id: 'testuser2',
        user_name: 'testuser2',
        access_token: '914633ab487686dd8c1fbe6836dbc23d6246173e'
      })
      */

      sendbird.events.onMessageReceived = function(obj) {
        console.log("New message received.");
        console.log(obj);
      }

    return {
      user: user,
      channel: channel
    };

  });
