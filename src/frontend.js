// jQuery, ace, and socketio are available as globals (see public/index.html)
var socket = io.connect();

$(function() {

  var editor = ace.edit("editor");

  editor.setFontSize(25);
  editor.setTheme("ace/theme/twilight");
  editor.getSession().setMode("ace/mode/javascript");

  editor.commands.addCommand({
    name: "Save",
    bindKey: {win: "Ctrl-S", mac: "Command-S"},
    readOnly: false,
    exec: function save() {
      $.post(location.pathname, {value: editor.getValue()}, "json");
    }
  });

  editor.commands.addCommand({
    name: "Run",
    bindKey: {win: "Ctrl-R", mac: "Command-R"},
    readOnly: false,
    exec: function run() {
      $.post(location.pathname, {value: editor.getValue(), run: true}, "json");
    }
  });

});