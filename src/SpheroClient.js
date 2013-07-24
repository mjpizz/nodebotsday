var zerorpc = require("zerorpc");
var rsvp = require("rsvp");

function SpheroClient(options) {
  this._client = new zerorpc.Client();
  this._client.connect("tcp://0.0.0.0:" + options.port);
  this._client.invoke("close");
  this._heading = 0;
}

SpheroClient.prototype._invokeAsPromise = function() {
  var args = Array.prototype.slice.call(arguments);
  return rsvp.Promise(function(resolve, reject) {
    args.push(function(err, res, more) {
      err ? reject(err) : resolve(res);
    });
    this._client.invoke.apply(this._client, args);
  }.bind(this));
}

SpheroClient.prototype.glow = function(r, g, b) {
  return this._invokeAsPromise("setRGBLED", r, g, b, false);
}

SpheroClient.prototype.roll = function(speed, seconds) {
  var rollPromise = this._invokeAsPromise("roll", this._heading, speed);
  if (arguments.length === 1) {
    return rollPromise;
  }

  return rollPromise.then(function() {
    return rsvp.Promise(function(resolve, reject) {
      setTimeout(function() {
        this._client.invoke("roll", this._heading, 0, function(err, res) {
          err ? reject(err) : resolve(res);
        });
      }.bind(this), seconds * 1000);
    }.bind(this));
  }.bind(this));
}

SpheroClient.prototype.stop = function() {
  return this.roll(0);
}

SpheroClient.prototype.turn = function(heading) {
  this._heading = heading;
  return this._invokeAsPromise("setHeading", this._heading);
}

SpheroClient.prototype.light = function(on) {
  return this._invokeAsPromise("setBackLED", on ? 1 : 0);
}

SpheroClient.prototype.disconnect = function() {
  var res = this.stop();
  this._client.close();
  return res;
}

module.exports = SpheroClient;
