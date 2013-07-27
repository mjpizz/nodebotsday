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
  function getCodePath(name) {
    var safeName = name.split(/[\/\.]/g).slice(-1)[0];
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

  // Serve all frontend code using enchilada (uses browserify internally).
  app.use("/frontend", enchilada({
    src: path.join(__dirname, "..", "src"),
    transforms: [rfileify]
  }));

  // Set up socket.io events.
  var runner = new SpheroRunner({port: options.spheroPort});
  var server = http.createServer(app);
  var io = socketio.listen(server);

  io.sockets.on("connection", function (socket) {

    function save(codePath, code) {
      var consoleLine = "=======================================================";
      console.log(consoleLine);
      console.log(code);
      console.log(consoleLine);
      console.log(codePath);
      console.log("saving...");
      fs.writeFileSync(codePath, code);
    }

    function run(code, stopCallback) {
      console.log("running...");
      try {
        runner.runSync(code, socket, function(err) {
          if (err) return console.error(err.stack);
          console.info("done running.")
        });
      } catch(err) {
        console.error(err.stack);
      }
    }

    // Handle events from frontend.
    socket.on("save", function(options) {
      save(getCodePath(options.path), options.code);
    });

    socket.on("run", function(options) {
      save(getCodePath(options.path), options.code);
      run(options.code);
    });

    socket.on("call", function(options) {
      var code = "ball[" + JSON.stringify(options.method.toString()) + "].apply(ball, " + JSON.stringify(options.args) + ")";
      var consoleLine = "=======================================================";
      console.log(consoleLine);
      console.log(code);
      console.log(consoleLine);
      console.log("running snippet...");
      runner.runSync(code, null, function(err) {
        if (err) return console.error(err.stack);
        console.info("done running snippet.")
      });
    });

  });

  // Start the server.
  console.log("starting up...");
  server.listen(options.httpPort);
  console.log("app started, visit http://localhost:" + options.httpPort);
}