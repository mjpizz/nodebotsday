var vm = require("vm");
var sync = require("sync");
var syncify = require("./syncify");
var Controller = require("./Controller");
var SpheroClient = require("./SpheroClient");
var SyncSphero = syncify(SpheroClient, {reject: ["on", "disconnect"]});


function SpheroRunner(options) {
  this._port = options.port;
}

SpheroRunner.prototype.runSync = function(code, socket, callback) {

  var controller = new Controller();
  var ball = new SyncSphero({port: this._port});

  // Allow the browser to disconnect this ball if it goes crazy.
  var looping = true;
  socket.on("stop", function() {
    looping = false;
    ball.disconnect();
  });

  sync(function() {

    try {

      // Initialize ball to something more sane for repeated runs.
      ball.light(true);
      ball.turn(0);
      ball.wait = function(sec) {
        return sync.sleep(sec * 1000);
      }

      // Run the code in a sandbox.
      var sandbox = {};
      sandbox.loop = function(callback) {
        while (looping) {
          sync.sleep(500);
          callback();
        }
      }
      sandbox.ball = ball;
      sandbox.controller = controller;
      vm.runInNewContext(code, sandbox, "SpheroRunner");

    } catch(err) {
      callback(err);
    } finally {
      ball.disconnect();
    }
    callback();

  }.bind(this));

}

module.exports = SpheroRunner;