var vm = require("vm");
var sync = require("sync");
var syncify = require("./syncify");
var SpheroClient = require("./SpheroClient");
var SyncSphero = syncify(SpheroClient, {reject: ["on", "disconnect"]});

function SpheroRunner(options) {
  this._port = options.port;
}

SpheroRunner.prototype.runSync = function(code) {

  sync(function() {
    try {

      var ball = new SyncSphero({port: this._port});
      ball.light(true);
      ball.turn(0);

      vm.runInNewContext(code, {
        print: console.log,
        ball: ball,
        wait: function(sec){return sync.sleep(sec*1000)}
      }, "SpheroRunner");

      ball.disconnect();

    } catch(err) {
      console.error(err.stack);
    }

  }.bind(this));

}

module.exports = SpheroRunner;