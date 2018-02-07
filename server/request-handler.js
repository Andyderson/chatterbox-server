var url = require('url');
var storage = require('./storage.js');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');

var express = require('express');

var routes =  express.Router();
routes.use(bodyParser.json({ type: 'application/json' }));

/* client */
routes.use('/', express.static(path.join(__dirname, '/../client')));


// routes.get('/', (request, response) => {
//     response.sendFile(path.join(__dirname + '/../client/index.html'));
// });

/* classes/messages */
routes.get('/classes/messages', (request, response) => {
  response.send(storage);
});

routes.post('/classes/messages', (request, response) => {
  console.log('!!!', request.body);

  storage.results.push(request.body);
  response.status(201).send(request.body);
});

routes.options('/classes/messages', (request, response) => {
  response.send('options');
})

/* 404 */
// routes.get('/', (request, response) => {
//   response.send('hello worlvzadsvd');
// });


exports.routes = routes;

/* ---------------- request handler ---------------- */

var defaultCorsHeaders = { 
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10
};

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var handleChatterBox = function(request, response) {
    console.log('test');

    fs.readFile("/client", function(err, data){
      console.log('index.html', data)

      if(err) {
        response.writeHead(404);
        response.write("YOU GOT LOST!");
      } else {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
      }
      response.end();
    });
  }

  var handleRequestMessages = function(request, response) {
    var actions = {
      'GET': function(request, response) {
        sendResponse(response, storage, 200);
      },
      'POST': function(request, response) {
        postRequest(request, response, function(data) {
          console.log(data);
          storage.results.push(data);
        }); 
      },
      'OPTIONS': function(request, response) {
        sendResponse(response, 'Options', 201);
      }
    };

    var action = actions[request.method];
    if (action) {
      action(request, response);
    } else {
      send404(request, response);
    }
  };

  var handleRequestUsernames = function(request, response) {
    sendResponse(response, 'This is usernames!', 200);
  };

  var handleRequestRoomnames = function(request, response) {

  };

  var routes = {
    '/' : handleChatterBox,
    '/classes/messages': handleRequestMessages,
    '/classes/messages/usernames': handleRequestUsernames,
    '/classes/messages/roomnames': handleRequestRoomnames
  }

  var urlParts = url.parse(request.url);
  var route = routes[urlParts.pathname];

  if (route) {
    route(request, response);
  } else {
    send404(request, response);
  }

};

var send404 = function(request, response) {
  sendResponse(response, 'Something nicer', 404);
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
};

// description: posts requests to server
// param: request Request from client to server
// param: reponse Information to be sent to client in response to http request
// param: statusCode Refers to client-side errors
// param: callback What to do with the data
var postRequest = function(request, response, callback) {
  var statusCode = 201;
  var data = '';
  request.on('data', function(chunk) { data += chunk; });
  request.on('end', function() { callback(JSON.parse(data)); });

  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  response.writeHead(statusCode, headers);

  response.end();
};

exports.requestHandler = requestHandler;