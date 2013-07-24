var util = require("util");
var EventEmitter = require("events").EventEmitter;

util.inherits(DummySphero, EventEmitter);
function DummySphero(options) {
  options = options || {};
  this._logger = options.logger || console;
}

DummySphero.prototype.connect = function() {
  this.emit("connected", this);
}

DummySphero.prototype.setRGBLED = function setRGB(r, g, b, persist, callback) {
  this._logger.log("setRGBLED", Array.prototype.slice.call(arguments));
  return callback();
}
DummySphero.prototype.setBackLED = function setRGB(l, callback) {
  this._logger.log("setBackLED", Array.prototype.slice.call(arguments));
  return callback();
}
DummySphero.prototype.setHeading = function setHeading(heading, callback) {
  this._logger.log("setHeading", Array.prototype.slice.call(arguments));
  return callback();
}
DummySphero.prototype.roll = function roll(heading, speed, callback) {
  this._logger.log("roll", Array.prototype.slice.call(arguments));
  return callback();
}

module.exports = DummySphero;