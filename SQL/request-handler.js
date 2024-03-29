var ourUrl = require('url');
var request = require("request");
var mysql = require('mysql');

/* You should implement your request handler function in this file.
 * But you need to pass the function to http.createServer() in
 * basic-server.js.  So you must figure out how to export the function
 * from this file and include it in basic-server.js. Check out the
 * node module documentation at http://nodejs.org/api/modules.html. */


/* These headers will allow Cross-Origin Resource Sharing.
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
var roomObj = {};
roomObj.results = [];
var roomName;
var obj = {};
obj.results = [{username: 'username', text: 'message', roomname: 'room'}];

var dbConnection = mysql.createConnection({
  user: "root",
  password: "eded",
  database: "chat"
});

dbConnection.connect();

var handleRequest = function(request, response) {
  // console.log('REQUEST RUNNING');
  var urlObj = ourUrl.parse(request.url);
//take the substring of pathname, and if there's classes/(dirname) then we're good
//otherwise throw 404 error
// /classes/messages
// console.log('typeof url: ' + typeof urlObj.pathname);
var pathArray = urlObj.pathname.split("/");
if (pathArray[1] !== 'classes') {
  //404 error
  response.writeHead(404, headers);
  response.end();
  return;
} else {
  roomName = pathArray[2];
}
  console.log('pathArray[1] is: ' + pathArray[1] + '. roomName is '+roomName);

  /* Request is an http.ServerRequest object containing various data
   * about the client request - such as what URL the browser is
   * requesting. */
  console.log("Serving request type " + request.method + " for url " + request.url);
  // console.log("Serving request uri " + request.uri + " and form " + request.form);
  var statusCode = 200;

  var headers = defaultCorsHeaders;
  // headers['Content-Type'] = "application/json";
  if (request.method === 'POST') {
    // var data;
    // request.on('data', function(chunk){
    //   data = JSON.parse(chunk.toString());
    //   console.log(data);
    //   dbConnection.query('insert into messages (username, message) values ("'+data['username']+'", "'+data['text']+'")', function() {
    //     response.writeHead(201, headers);
    //     response.end();
    //   });
    // });

    var data;
    request.on('data', function(chunk){
      data = chunk;
      data = data.toString().split('&');
      for (var i = 0; i < data.length; i++){
        data[i] = data[i].split('=')[1].replace(/%20/g, ' ').replace('\\', '').replace(/%2C/g, ',');
      }
      console.log('DATA IS ');
      console.log(data);
      // data = data.split(' ');
      dbConnection.query('insert into messages (username, message) values ("'+data[0]+'", "'+data[1]+'")', function(err) {
        response.writeHead(201, headers);
        response.end();
      });
    });

  } else if(request.method === 'GET') {
    //below is the get request
    if (roomName !== "messages") {
      //if room is selected
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(roomObj.results));
    } else {
      //if no room is selected
      // console.log('GET REQUEST MADE in msgs');
      dbConnection.query('select * from messages', function(err, rows, fields) {
        response.writeHead(statusCode, headers);
        response.end(JSON.stringify(rows));
      });
    }

  } else if(request.method === 'OPTIONS'){
    // TODO: handle requests for method === 'OPTIONS'
    response.writeHead(200, headers);
    response.end();
  }else {
    // unkown HTTP method
    response.writeHead(405, headers);
    response.end("Unknown method: " + request.method);
  }
};

module.exports.handleRequest = handleRequest;