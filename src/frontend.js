// jQuery, ace, and socketio are available as globals (see public/index.html)
var socket = io.connect();

$(function() {

  var editor = ace.edit("editor");

  editor.setFontSize(25);
  editor.setTheme("ace/theme/twilight");
  editor.getSession().setMode("ace/mode/javascript");

  function save() {
    $.post(location.pathname, {value: editor.getValue()}, "json");
  }

  function run() {
    $.post(location.pathname, {value: editor.getValue(), run: true}, "json");
  }

  function makeButton(method, args) {
    args = args || [];
    var button = $("<div>").text("ball." + method + "(" + JSON.stringify(args).slice(1, -1) + ")").click(function() {
      $.post("/snippet", {method: method, args: args}, "json");
    });
    $("#buttons").append(button);
  }

  // Set up editor shortcuts.
  editor.commands.addCommand({
    name: "Save",
    bindKey: {win: "Ctrl-S", mac: "Command-S"},
    readOnly: false,
    exec: save
  });

  editor.commands.addCommand({
    name: "Run",
    bindKey: {win: "Ctrl-R", mac: "Command-R"},
    readOnly: false,
    exec: run
  });

  // Make a run button.
  $("#buttons").append($("<div>").text("RUN IT!").addClass("run").click(run));

  // Add shortcut buttons.
  makeButton("glow", [255, 0, 0]);
  makeButton("glow", [0, 255, 0]);
  makeButton("glow", [0, 0, 255]);
  makeButton("glow", [255, 0, 255]);
  makeButton("turn", [90]);
  makeButton("turn", [45]);
  makeButton("turn", [-45]);
  makeButton("roll", [1]);
  makeButton("roll", [0.5]);
  makeButton("stop");
});