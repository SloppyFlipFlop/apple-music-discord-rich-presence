const applescript = require("applescript") as any;
const path = require("path") as any;
const fs = require("fs") as any;
const discordRP = require("discord-rich-presence") as any;
const { app, BrowserWindow } = require("electron") as any;

const client = discordRP("1106165216330403841" as string);

const artist = "Artist Name";
const album = "Album Name";

type Data = {
  song: string;
  album: string;
  artist: string;
  finish: string;
  pos: string;
  state: string;
};

const createData = (): Data => ({
  song: "",
  album: "",
  artist: "",
  finish: "",
  pos: "",
  state: "",
});

let data: Data = createData();
let lastData: Data = createData();

const readData: string = fs.readFileSync(
  path.join(__dirname, ".", "main.applescript"),
  "utf8"
);
const linesArr: string[] = readData.split(/\r?\n/);

const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 0,
    height: 0,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile("index.html");
};

const setTime = (sec: number): number => {
  const t = new Date();
  t.setSeconds(t.getSeconds() - sec);
  return t.getTime();
};

app.whenReady().then(createWindow);

const update = (): void => {
  applescript.execString(linesArr[0], (err: Error, res: any) => {
    if (err) {
      console.log(err);
    }
    data.song = res;
  });

  applescript.execString(linesArr[1], (err: Error, res: any) => {
    // this is the album
    if (err) {
      console.log(err);
    }
    data.album = res;
  });

  applescript.execString(linesArr[2], (err: Error, res: any) => {
    // this is the artist
    if (err) {
      console.log(err);
    }
    data.artist = res;
  });

  applescript.execString(linesArr[3], (err: Error, res: any) => {
    // this is the finish time
    if (err) {
      console.log(err);
    }
    data.finish = res;
  });

  applescript.execString(linesArr[4], (err: Error, res: any) => {
    // this is the position
    if (err) {
      console.log(err);
    }
    data.pos = res;
  });

  applescript.execString(linesArr[5], (err: Error, res: any) => {
    // this is the state
    if (err) {
      console.log(err);
    }
    data.state = res;
  });

  if (data.song !== lastData.song) {
    lastData = data;
    client.updatePresence({
      state: data.state,
      details: data.song,
      startTimestamp: setTime(parseInt(data.pos)),
      endTimestamp: setTime(parseInt(data.finish)),
      largeImageKey: "icon",
      largeImageText: data.album,
      smallImageKey: "icon",
      smallImageText: data.artist,
      instance: true,
    });
  }
};

setInterval(update, 1000);
