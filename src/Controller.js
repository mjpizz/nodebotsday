var EventEmitter = require("events").EventEmitter;

function Controller() {
  this._emitter = new EventEmitter();
  setInterval(function() {
    this._emitter.emit("button");
  }.bind(this), 1000);
}

Controller.prototype.on = function(eventName, callback) {
  this._emitter.on(eventName, callback);
}

module.exports = Controller;