var zerorpc = require("zerorpc");
var Sphero = require("node-sphero").Sphero;

module.exports = function SpheroServer(options) {
  options = options || {};
  if (!(this instanceof SpheroServer)) {
    return new SpheroServer(options)
  }

  this._logger = options.logger || console;
  this._host = "tcp://0.0.0.0:" + options.port;
  this._sphero = options.sphero || new Sphero();

  this._sphero.on("connected", function(ball) {
    server = new zerorpc.Server(ball);

    // Modify the event listener to support zerorpc streaming.
    var originalOn = ball.on;
    ball.on = function(eventName, reply) {
      originalOn.call(ball, eventName, function(data) {
        reply(null, data, true);
      });
    }

    this._logger.log("sphero ready on:", this._host);
    server.bind(this._host);
  }.bind(this));

  this._sphero.connect();
}
