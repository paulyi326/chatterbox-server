/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var url = require('url');
var _ = require('underscore');
var storage = [];



module.exports = {
  handleRequest: function(request, response) {

    var statusCode = 200;
    //  Without this line, this server wouldn't work. See the note
    //  * below about CORS.
    var headers = module.exports.defaultCorsHeaders;
    headers['Content-Type'] = "text/plain";
    var responseText='';
    var req=url.parse(request.url, true);

    //OPTIONS
    if(request.method === "OPTIONS") {
      // handle options request
      statusCode=200;
    //GET
    } else if (request.method === 'GET') {
      var query=req.query;

      headers['Content-Type'] = "application/json";
      statusCode=200;
      responseText=JSON.stringify(module.exports.returnResults(query));
    //POST
    } else if (request.method === 'POST') {
      var body = "";
      request.on('data', function (chunk) {
        body += chunk;
      });
      request.on('end', function () {
        var post = JSON.parse(body);
        post.id = storage.length;
        post.createdAt = new Date();
        storage[post.id] = post;

        statusCode=201;

      });
    } else {
      statusCode=404;
    }

    // // console.log(response);
    // /* the 'request' argument comes from nodes http module. It includes info about the
    // request - such as what URL the browser is requesting. */

    // /* Documentation for both request and response can be found at
    //  * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

    console.log("Serving request type " + request.method + " for url " + request.url);

    // /* .writeHead() tells our server what HTTP status code to send back */
    response.writeHead(statusCode, headers);

    // /* Make sure to always call response.end() - Node will not send
    //  * anything back to the client until you do. The string you pass to
    //  * response.end() will be the body of the response - i.e. what shows
    //  * up in the browser.*/
    response.end(responseText);
  },

  returnResults: function(queryObj) {
    var resultsObj={'results':[]};
    var limit=queryObj.limit || 100;
    var order=queryObj.order;

    limit = Math.min(limit, storage.length);

    if (order===undefined) {
      for (var count=0; count<limit; count++) {
        resultsObj.results.push(storage[count]);
      }
    } else if (order[0]==='-') {
      order=order.slice(1);
      resultsObj.results=_.sortBy(storage, order);
      resultsObj.results=resultsObj.results.reverse();
    } else {
      resultsObj.results=_.sortBy(storage, order);
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
