var url = require('url');
var _ = require('underscore');
var fs=require('fs');
var storage = [];

module.exports = {
  handleRequest: function(request, response) {

    var statusCode = 404;
    var headers = module.exports.defaultCorsHeaders;
    headers['Content-Type'] = "text/plain";
    var responseText='';
    var req=url.parse(request.url, true);

    //only peform these requests for certain paths
    if (req.pathname.slice(0, 8)==='/classes') {
      var parameters=req.pathname.slice(1).split('/');
      var query=req.query;
      if (parameters[1]==='room') {
        query['roomname']=parameters[2];
      }
      //OPTIONS
      if(request.method === "OPTIONS") {
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
        //since data comes in a stream, we need to concatenate and return once it has all loaded
        request.on('data', function (chunk) {
          body += chunk;
        });
        //adjust atributes and add to storage once all data has come in
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

      // /* .writeHead() tells our server what HTTP status code to send back */
      response.writeHead(statusCode, headers);

      // /* Make sure to always call response.end() - Node will not send
      //  * anything back to the client until you do. The string you pass to
      //  * response.end() will be the body of the response - i.e. what shows
      //  * up in the browser.*/
      response.end(responseText);

    //load client-side html at main server address
    } else if (req.pathname==='/') {
      headers['Content-Type'] = "text/html";

      //read in the file and send (async)
      fs.readFile("./client/index.html", {encoding: 'utf8'}, function (err,data) {
        if (err) {
          throw err;
        }
        statusCode=200;
        response.writeHead(statusCode, {'Content-Type': 'text/html'});
        response.end(data);
      });
    } else {
      //serve other files - use for dependencies
      //handle css and js files differently
      if (req.pathname.slice(-3) === 'css') {
        var contentType = "text/css";
      } else {
        var contentType = "text/javscript";
      }

      //read file and send
      fs.readFile("./client"+req.pathname, {encoding: 'utf8'}, function (err,data) {
        if (err) {
          console.log('there is an error')
          throw err;
        }
        statusCode=200;
        response.writeHead(statusCode, {'Content-Type': contentType});
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
    //filter if roomname is specified
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

  defaultCorsHeaders: {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "access-control-max-age": 10 // Seconds.
  }
};
