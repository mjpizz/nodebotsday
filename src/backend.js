var fs = require("fs");
var http = require("http");
var path = require("path");
var express = require("express");
var enchilada = require("enchilada");
var rfile = require("rfile");
var rfileify = require("rfileify");
var socketio = require("socket.io");
var Mustache = require("mustache");
var SpheroRunner = require("./SpheroRunner");

module.exports = function run(options) {

  // Start the web server.
  var app = express();
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Serve document editing from /code
  var runner = new SpheroRunner({port: options.spheroPort});
  function getCodePath(name) {
    var safeName = name.split(/[\/\.]/g)[0];
    return path.join(__dirname, "..", "code", safeName) + ".js";
  }

  app.get("/code/:name", function(req, res) {
    var codePath = getCodePath(req.params.name);
    var body = "ball.glow(0, 255, 0)\nwait(2)\nball.roll(1, 2)";
    if (fs.existsSync(codePath)) {
      body = rfile(codePath);
    }
    var codeView = Mustache.compile(rfile("./code.html"));
    res.end(codeView({name: req.params.name, body: body}));
  });

  app.post("/code/:name", function(req, res) {
    var codePath = getCodePath(req.params.name);
    var code = req.body.value;
    var consoleLine = "=======================================================";
    console.log(consoleLine);
    console.log(code);
    console.log(consoleLine);
    console.log(codePath);
    console.log("saving...");
    fs.writeFileSync(codePath, code);

    // Run the script if requested.
    if (req.body.run) {
      console.log("running...");
      try {
        runner.runSync(code);
      } catch(err) {
        console.error(err.stack);
      }

    }

    res.end();
  });

  app.post("/snippet", function(req, res) {
    var code = "ball[" + JSON.stringify(req.body.method.toString()) + "].apply(ball, " + JSON.stringify(req.body.args) + ")";
    var consoleLine = "=======================================================";
    console.log(consoleLine);
    console.log(code);
    console.log(consoleLine);
    console.log("running snippet...");
    runner.runSync(code);
    res.end();
  });

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