// jQuery and socketio are available as globals (see public/index.html)
var socket = io.connect();
$(function() {
  $("body").html("hello world");
});