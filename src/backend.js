var http = require("http");
var path = require("path");
var express = require("express");
var enchilada = require("enchilada");
var rfileify = require("rfileify");
var socketio = require("socket.io");
var SpheroServer = require("./SpheroServer");

module.exports = function run(options) {

  // Start the Sphero RPC server.
  var spheroServer = new SpheroServer({
    port: options.spheroPort,
    logger: options.logger,
    sphero: options.sphero
  });

  // Start the web server.
  var app = express();
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Serve all frontend code using enchilada (uses browserify internally).
  app.use("/frontend", enchilada({
    src: path.join(__dirname, "..", "src"),
    transforms: [rfileify]
  }));

  // Set up socket.io events.
  var server = http.createServer(app);
  var io = socketio.listen(server);
  io.sockets.on("connection", function (socket) {
    // TODO: use the socket
  });

  // Start the server.
  console.log("starting up...");
  server.listen(options.httpPort);
  console.log("app started, visit http://localhost:" + options.httpPort);
}