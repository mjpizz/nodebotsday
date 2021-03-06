var zerorpc = require("zerorpc");
var Sphero = require("node-sphero").Sphero;

module.exports = function SpheroServer(options) {
  options = options || {};
  if (!(this instanceof SpheroServer)) {
    return new SpheroServer(options)
  }

  this._host = "tcp://0.0.0.0:" + options.port;
  this._sphero = options.sphero || new Sphero();

  this._sphero.on("connected", function(ball) {
    server = new zerorpc.Server(ball);
    server.setMaxListeners(999999);

    // TODO: figure out issue with listener memory leak
    // // Modify the event listener to support zerorpc streaming.
    // var originalOn = ball.on;
    // ball.on = function(eventName, reply) {
    //   originalOn.call(ball, eventName, function(data) {
    //     reply(null, data, true);
    //   });
    // }

    server.bind(this._host);
  }.bind(this));

  this._sphero.connect();
}
