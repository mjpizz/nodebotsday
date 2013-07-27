var vm = require("vm");
var sync = require("sync");
var syncify = require("./syncify");
var SpheroClient = require("./SpheroClient");
var SyncSphero = syncify(SpheroClient, {reject: ["on"]});

function SpheroRunner(options) {
  this._port = options.port;
}

SpheroRunner.prototype.runSync = function(code) {

  var wrappedCode = [
    "ball.light(true);",
    "ball.turn(0);",
    code,
    "ball.disconnect();"
  ].join("\n");

  sync(function() {
    try {

      vm.runInNewContext(wrappedCode, {
        print: console.log,
        ball: new SyncSphero({port: this._port}),
        wait: function(sec){return sync.sleep(sec*1000)}
      }, "SpheroRunner");

    } catch(err) {
      console.error(err.stack);
    }

  }.bind(this));

}

module.exports = SpheroRunner;