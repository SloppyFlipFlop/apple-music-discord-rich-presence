import MusicKit from "musickit-js";

import appleMusicDevToken from "./appleMusicToken";

interface MusicKitConfiguration {
  developerToken: string;
  app: {
    name: string;
    build: string;
  };
}

const configuration: MusicKitConfiguration = {
  developerToken: appleMusicDevToken,
  app: {
    name: "AppleMusicKitExample",
    build: "1.0.0",
  },
};

const music: MusicKit.Music = MusicKit.configure(configuration) as any;

let musicUserToken = "";

music.authorize().then((userToken: string) => {
  console.log(`Authorized, music user token: ${userToken}`);
  // Store the music user token for later use
  musicUserToken = userToken;
});

export default musicUserToken;
