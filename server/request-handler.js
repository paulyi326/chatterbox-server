/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var url = require('url');
var _ = require('underscore');
var fs=require('fs');
var storage = [];


module.exports = {
  handleRequest: function(request, response) {

    var statusCode = 404;
    //  Without this line, this server wouldn't work. See the note
    //  * below about CORS.
    var headers = module.exports.defaultCorsHeaders;
    headers['Content-Type'] = "text/plain";
    var responseText='';
    var req=url.parse(request.url, true);

    //only allow correct path
    if (req.pathname.slice(0, 8)==='/classes') {

      var parameters=req.pathname.slice(1).split('/');

      var query=req.query;

      if (parameters[1]==='room') {
        query['roomname']=parameters[2];
      }

      //OPTIONS
      if(request.method === "OPTIONS") {
        // handle options request
        statusCode=200;
      //GET
      } else if (request.method === 'GET') {

        headers['Content-Type'] = "application/json";
        statusCode=200;
        responseText=JSON.stringify(module.exports.returnResults(query));
      //POST
      } else if (request.method === 'POST') {
        statusCode=201;
        var body = "";
        request.on('data', function (chunk) {
          body += chunk;
        });
        request.on('end', function () {
          var post = JSON.parse(body);
          post.id = storage.length;
          post.createdAt = new Date();
          if (query['roomname'] !== undefined) {
            post.roomname = query['roomname']
          }
          storage[post.id] = post;
        });
      }


      // // console.log(response);
      // /* the 'request' argument comes from nodes http module. It includes info about the
      // request - such as what URL the browser is requesting. */

      // /* Documentation for both request and response can be found at
      //  * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */


      // /* .writeHead() tells our server what HTTP status code to send back */
      response.writeHead(statusCode, headers);

      // /* Make sure to always call response.end() - Node will not send
      //  * anything back to the client until you do. The string you pass to
      //  * response.end() will be the body of the response - i.e. what shows
      //  * up in the browser.*/
      response.end(responseText);

    } else if (req.pathname==='/') {
      console.log('this is doing something');
      headers['Content-Type'] = "text/html";
      statusCode=200;
      // responseText='<html>'+
      //               '<body>'+
      //               '<h1>Goodbye world...</h1>'+
      //               '</body>'+
      //               '</html>';

      fs.readFile("./client/index.html", {encoding: 'utf8'}, function (err,data) {
        if (err) {
          console.log('there is an error')
          throw err;
        }
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(data);
      });
    } else {
      //check for file and serve that file
      //use for dependencies
      console.log(req.pathname);
      headers['Content-Type'] = "text/html";
      statusCode=200;

      fs.readFile("./client"+req.pathname, {encoding: 'utf8'}, function (err,data) {
        if (err) {
          console.log('there is an error')
          throw err;
        }
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(data);
      });
    }

  },

  returnResults: function(queryObj) {
    var resultsObj={'results':[]};
    var limit=queryObj.limit || 100;
    var order=queryObj.order;
    var roomname = queryObj.roomname;

    var filterStorage=storage;
    if (roomname) {
      filterStorage = _.filter(storage, function(messageObj) {
        return messageObj.roomname === roomname;
      });
    }

    limit = Math.min(limit, filterStorage.length);

    if (order===undefined) {
      for (var count=0; count<limit; count++) {
        resultsObj.results.push(filterStorage[count]);
      }
    } else if (order[0]==='-') {
      order=order.slice(1);
      resultsObj.results=_.sortBy(filterStorage, order);
      resultsObj.results=resultsObj.results.reverse();
    } else {
      resultsObj.results=_.sortBy(filterStorage, order);
    }

    return resultsObj;
  },

  /* These headers will allow Cross-Origin Resource Sharing (CORS).
   * This CRUCIAL code allows this server to talk to websites that
   * are on different domains. (Your chat client is running from a url
   * like file://your/chat/client/index.html, which is considered a
   * different domain.) */
  defaultCorsHeaders: {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "access-control-max-age": 10 // Seconds.
  }
};
