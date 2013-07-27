var EventEmitter = require("events").EventEmitter;
var zerorpc = require("zerorpc");
var rsvp = require("rsvp");

// This sensor list is copied from inside the node-sphero library.
SENSORS = {
  gyro_h: {
    MASK1: 0x000000001
  },
  gyro_m: {
    MASK1: 0x000000002
  },
  gyro_l: {
    MASK1: 0x000000004
  },
  left_motor_emf: {
    MASK1: 0x000000020
  },
  right_motor_emf: {
    MASK1: 0x000000040
  },
  magnometer_z: {
    MASK1: 0x000000080
  },
  magnometer_y: {
    MASK1: 0x000000100
  },
  magnometer_x: {
    MASK1: 0x000000200
  },
  gyro_z: {
    MASK1: 0x000000400
  },
  gyro_y: {
    MASK1: 0x000000800
  },
  gyro_x: {
    MASK1: 0x000001000
  },
  accelerometer_z: {
    MASK1: 0x000002000
  },
  accelerometer_y: {
    MASK1: 0x000004000
  },
  accelerometer_x: {
    MASK1: 0x000008000
  },
  imu_yaw: {
    MASK1: 0x000010000
  },
  imu_roll: {
    MASK1: 0x000020000
  },
  imu_pitch: {
    MASK1: 0x000040000
  }
}

function SpheroClient(options) {
  this._client = new zerorpc.Client();
  this._client.connect("tcp://0.0.0.0:" + options.port);
  this._heading = 0;

  // Set up sensor event reading.
  // TODO: backport this into the original library? maybe he was trying to keep the API small
  this._emitter = new EventEmitter();
  this._watchedSensorNames = {};
  this._bindToServerEvents();
}

SpheroClient.prototype._bindToServerEvents = function() {
  this._client.invoke("on", "notification", function(err, data, more) {
    this._eachWatchedSensor(function(sensorName, sensor) {
      this._emitter.emit(sensorName, data);
    }.bind(this));
  }.bind(this));
}

SpheroClient.prototype._eachWatchedSensor = function(callback) {
  return Object.keys(this._watchedSensorNames).forEach(function(sensorName) {
    callback(sensorName, SENSORS[sensorName]);
  });
}

SpheroClient.prototype._watchSensor = function(sensorName) {
  this._watchedSensorNames[sensorName] = true;
  var sensors = [];
  this._eachWatchedSensor(function(name, sensor){sensors.push(sensor)});
  this._setDataStreaming(sensors, 4, 5, null);
}

SpheroClient.prototype._invokeAsPromise = function() {
  var args = Array.prototype.slice.call(arguments);
  return rsvp.Promise(function(resolve, reject) {
    args.push(function(err, res) {
      err ? reject(err) : resolve(res);
    });
    this._client.invoke.apply(this._client, args);
  }.bind(this));
}

SpheroClient.prototype._setDataStreaming = function(sensors, hertz, frames, count) {
  return this._invokeAsPromise("setDataStreaming", sensors, hertz, frames, count);
}

SpheroClient.prototype.on = function(sensorName, callback) {
  this._watchSensor(sensorName);
  this._emitter.on(sensorName, callback);
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
  this._client.invoke("setDataStreaming", [], null, null, null);
  var res = this.stop();
  this._client.close();
  return res;
}

module.exports = SpheroClient;
