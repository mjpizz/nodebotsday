# nodebotsday 2013

This is a prototype repo for letting first-time programmers hack on the Sphero.
Please consider this code as hacked-together quickly for nodebotsday :)

1. Connect the Sphero over bluetooth.
2. Run `bin/sphero`, which keeps a the bluetooth connection alive and serves Sphero over zerorpc (this should probably change)
3. Run `bin/web` to get the web interface
4. Visit localhost:7777/code/whatever, which will give an ACE editor that saves code to `./code`. Warning: this means anybody can just open up the app and save code to your machine :)

# Random Notes

Example...

    var ball = new Sphero();
    
    ball.glow(0, 255, 0)
    
      .then(function() {
        return ball.roll(0.2, 2);
        
      }).then(function() {
        return ball.light(true);
        
      }).then(function() {
        return ball.turn(110);
        
      }).then(function() {
        return ball.roll(0.3, 2);
        
      }).then(function(){
        return ball.glow(255, 0, 0);
        
      // Catch errors.
      }, function(err) {
        console.error(err.traceback || err);
      });

Synchronous example...

    var sync = require("sync");
    var syncify = require("./src/syncify");
    var SpheroClient = require("./src/SpheroClient");
    
    var SyncSphero = syncify(SpheroClient, {reject: ["on"]});
    var ball = new SyncSphero({port: 7778});
    var sleep = sync.sleep;
    
    sync(function() {
      
      ball.glow(0, 255, 0)
      ball.turn(150)
      sleep(1000)
      ball.roll(0.5)
      sleep(2000)
      ball.roll(1)
      ball.turn(10)
      sleep(2000)
      ball.glow(255, 0, 0)
      ball.disconnect()
      
    });

Events example (not fully working)...

    var SpheroClient = require("./src/SpheroClient")
    
    var client = new SpheroClient({port: 7778})
    
    client.on("gyro_y", function(data) {
      console.log("got gyro_y:", data.SOP2, data.ID_CODE, data.DATA);
    });

