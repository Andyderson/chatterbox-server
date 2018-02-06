var url = require('url');
var storage = require('./storage.js');
/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var handleRequestMessages = function(request, response) {
    var actions = {
      'GET': function(request, response) {
        sendResponse(response, storage, 200);
      },
      'POST': function(request, response) {
        postRequest(request, function(data) {
          console.log(data);
        });
      }
    };

    var action = actions[request.method];
    if (action) {
      action(request, response);
    } else {
      send404(request, response);
    }

    // actions['GET'](request, response);
  };

  var handleRequestUsernames = function(request, response) {
    sendResponse(response, 'This is usernames!', 200);
  };

  var handleRequestRoomnames = function(request, response) {

  };

  var routes = {
    '/classes/messages': handleRequestMessages,
    '/classes/messages/usernames': handleRequestUsernames,
    '/classes/messages/roomnames': handleRequestRoomnames
  }

  var urlParts = url.parse(request.url);
  console.log('HEY LOOK AT THIS', urlParts.path === '/classes/messages');
  var route = routes[urlParts.path];

  if (route) {
    route(request, response);
    console.log('HELLO!!');
  } else {
    send404(request, response);
    console.log('IM WORKING!!!');
  }

};

var send404 = function(request, response) {
  sendResponse(response, 'Something nicer', 404);
}

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

var defaultCorsHeaders = { //TODO: research what defaultCorsHeaders is
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

// description: Sending of data as a response to client
// param: response Information to be sent to client in response to http request
// param: data Whats being sent or recieved
// param: statusCode Refers to client-side errors
var sendResponse = function(response, data, statusCode) {
  statusCode = statusCode || 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
}

// description: posts requests to server
// param: request Request from client to server
// param: callback What to do with the data
var postRequest = function(request, callback) {
  var data = '';
  request.on('data', function(chunk) { data += chunk; });
  request.on('end', function() { callback(data); });
}

exports.requestHandler = requestHandler;
