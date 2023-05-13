var applescript = require("applescript");
var path = require("path");
var fs = require("fs");
var discordRP = require("discord-rich-presence");
var _a = require("electron"),
  app = _a.app,
  BrowserWindow = _a.BrowserWindow;
var client = discordRP("1106165216330403841");
var createData = function () {
  return {
    song: "",
    album: "",
    artist: "",
    finish: "",
    pos: "",
    state: "",
  };
};
var data = createData();
var lastData = createData();
var readData = fs.readFileSync(
  path.join(__dirname, ".", "main.applescript"),
  "utf8"
);
var linesArr = readData.split(/\r?\n/);
var createWindow = function () {
  var win = new BrowserWindow({
    width: 0,
    height: 0,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile("index.html");
};
var setTime = function (sec) {
  var t = new Date();
  t.setSeconds(t.getSeconds() - sec);
  return t.getTime();
};
app.whenReady().then(createWindow);
var update = function () {
  applescript.execString(linesArr[0], function (err, res) {});
};
setInterval(update, 1000);
