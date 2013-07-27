var vm = require("vm");
var sync = require("sync");
var syncify = require("./syncify");
var SpheroClient = require("./SpheroClient");
var SyncSphero = syncify(SpheroClient, {reject: ["on", "disconnect"]});

function SpheroRunner(options) {
  this._port = options.port;
}

SpheroRunner.prototype.runSync = function(code, sandbox, callback) {

  sync(function() {

    try {

      var ball = new SyncSphero({port: this._port});

      // Initialize ball to something more sane for repeated runs.
      ball.light(true);
      ball.turn(0);
      ball.wait = function(sec) {
        return sync.sleep(sec * 1000);
      }

      // Run the code in a sandbox.
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