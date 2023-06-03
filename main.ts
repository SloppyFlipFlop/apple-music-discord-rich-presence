import dotenv from "dotenv";
dotenv.config();
import { extractSongData } from "./applescript";
const discordRPC = require("discord-rpc") as any;
const rpc = new discordRPC.Client({ transport: "ipc" });
discordRPC.register(process.env.DISCORD_CLIENT_ID);

type SongType = {
  artworkURL: string;
  song: string;
  endTimestamp: number;
  artist: string;
  album: string;
};

const updateActivity = async (songData: SongType) => {
  const { song, endTimestamp: end, artist, album, artworkURL } = songData;
  if (!rpc) return;

  rpc.setActivity({
    details: `${song}`,
    state: `by: ${artist}`,
    startTimestamp: new Date(),
    // largeImageKey: `${artworkURL}`,
    largeImageKey: "apple_music_logo",
    largeImageText: `${song}`,
    buttons: [
      {
        label: "Listen on Apple Music",
        url: "https://music.apple.com/us/album/never-gonna-give-you-up/1558533900?i=1558534271",
      },
      // { label: "View on Apple Music", url: "" },
    ],
    instance: true,
  });
};

rpc.on("ready", async () => {
  const songData = await extractSongData();
  updateActivity(songData);
  console.log(songData);

  console.log("Discord RPC is ready and running!");

  // update the activity everytime the song changes
  setInterval(async () => {
    const songData = await extractSongData();
    updateActivity(songData);
  }, songData.endTimestamp * 1000);
});

rpc.on("disconnected", () => {
  console.log("Discord RPC disconnected!");
  process.exit(0);
});

rpc.on("error", (error: any) => {
  console.log("Error:", error);
});

rpc
  .login({ clientId: process.env.DISCORD_CLIENT_ID })
  .catch((error: any) => console.log(error));
