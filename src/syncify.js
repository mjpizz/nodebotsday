var util = require("util");
var sync = require("sync");

function convertToSyncMethod(method) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    function execute() {
      var args = Array.prototype.slice.call(arguments);
      var callback = args.pop();
      try {
        result = method.apply(this, args);
        if (result.then) {
          result.then(function success(res) {
            callback(null, res)
          }, function failure(err) {
            callback(err);
          });
        } else {
          callback(null, result);
        }
      } catch(err) {
        callback(err);
      }
    }
    return execute.sync.apply(execute, [this].concat(args));
  }
}

module.exports = function syncify(Class, options) {
  options = options || {};

  util.inherits(Child, Class);
  function Child() {
    return Class.prototype.constructor.apply(this, arguments);
  }

  for (var methodName in Child.prototype) {
    if (methodName.charAt(0) !== "_") {
      if (options.reject && options.reject.indexOf(methodName) >= 0) {
        continue;
      }
      Child.prototype[methodName] = convertToSyncMethod(Child.prototype[methodName])
    }
  }

  return Child;
}