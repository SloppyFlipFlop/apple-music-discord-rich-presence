// // const applescript = require("applescript") as any;
// // const path = require("path") as any;
// // const fs = require("fs") as any;
// // const discordRP = require("discord-rich-presence") as any;
// import express from "express";
// const app = express();

// import token from "./utils/appleMusicToken";

// const client = discordRP("1106165216330403841" as string);

// // make a axios request to get the current song
// //
// const axios = require("axios") as any;

// const getCurrentSong = async (): Promise<void> => {
//   const url = `https://api.music.apple.com/v1/me/storefront`; // Get the most recent song

//   try {
//     const response = await axios.get(url, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const { include } = response;
//     const currentSong = include[0];

//     if (currentSong) {
//       return currentSong;
//     } else {
//       throw new Error("No song found");
//     }
//   } catch (error) {
//     console.error("Error retrieving current song:", error);
//     throw error;
//   }
// };

// const getSongInfo = async (): Promise<void> => {
//   try {
//     const res = await axios.get(
//       "https://api.music.apple.com/v1/catalog/us/albums/1616728060",
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     console.log("success");
//     console.log(res.data);
//     // log all the attributes
//     const attributes = res.data.data[0].attributes;
//     console.log(attributes);
//   } catch (error) {
//     console.log(error);
//   }
// };

// const startSever = () => {
//   app.get("/", (req, res) => {
//     res.send({ data: getCurrentSong() });
//   });

//   app.listen(3000, () => {
//     console.log("Example app listening on port 3000!");
//   });
// };

// startSever();

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// import musicUserToken from "./utils/userToken";

// when the app is started up for the first time, it will ask for permission to use the discord account and ask the user to connect to their apple music account
// once the user has connected their apple music account, the app will start to listen to the music that is playing
// the app will then send the song information to the discord rich presence api

// import fs from "fs";

// const appleMusicLogin = async (): Promise<void> => {
//   const token = appleMusicDevToken;
//   // console.log(token);
//   const htmlContent: string = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Apple Music Login</title>
//         <meta name="apple-music-developer-token" content="${token}">
//         <meta name="apple-music-app-name" content="Apple Music Discord App">
//         <meta name="apple-music-app-build" content="1.0.0">
//         <script src="https://js-cdn.music.apple.com/musickit/v1/musickit.js"></script>
//         <script src="./utils/userToken.js"></script>
//       </head>
//       <body>
//         <h1>Please login into Apple Music to use this Discord Rich Presence App</h1>
//         <p>This is a dynamically generated HTML file.</p>

//         <button id="apple-music-authorize"></button>
//         <button id="apple-music-unauthorize"></button>

//         <p data-apple-music-now-playing></p>

//         <time id="apple-music-current-playback-duration"></time>
//   <time id="apple-music-current-playback-time"></time>
//   <span id="apple-music-current-playback-progress"></span>

//       </body>
//     </html>
//   `;

//   try {
//     await fs.promises.writeFile("index.html", htmlContent);
//     const { exec } = require("child_process");
//     exec("open index.html").then(() => {});
//     console.log("HTML file opened successfully");
//     console.log("musicUserToken", musicUserToken || "no token");
//   } catch (error) {
//     console.error("Error creating HTML file:", error);
//   }
// };

import express from "express";
import appSettings from "./config/appSettings";
import appleMusicDevToken from "./utils/appleMusicToken";
const clientID = appSettings.discord.clientId;
const clientSecret = appSettings.discord.discordClientSecret;
const discordRPC = require("discord-rpc") as any;
const rpc = new discordRPC.Client({ transport: "ipc" });
import { Request, Response } from "express";
import axios from "axios";
const app = express();
const port = 3001; // Choose a suitable port

// Route for initiating the authentication process
app.get("/auth", (_, res) => {
  axios
    .post(
      "https://appleid.apple.com/auth/token",
      {
        client_id: clientID,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: "code",
        redirect_uri: "http://localhost:3001/auth",
        scope: "user-read-currently-playing",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response: any) => {
      res.send(response.data);
      res.redirect("/");
    })
    .catch((error: any) => {
      console.log(error.response.data);
    });
});

app.get("/", async (_, res) => {
  // make a simple axios request to get the current song
  // const url = `https://api.music.apple.com/v1/me/recent/played/tracks`; // Get the most recent song
  const url = `https://api.music.apple.com/v1/storefronts/us`; // Get the most recent song

  try {
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${appleMusicDevToken}`,
        },
      })
      .then((response: any) => {
        // console.log(response.data);
        const { data } = response;
        console.log("data", data.data[0]);
        res.send("complete");
      })
      .catch((error: any) => {
        console.log(error.response.data);
      });
  } catch (error) {
    console.error("Error retrieving current song:", error);
    throw error;
  }
});

// Route for handling the callback from Apple's authentication page
app.get("/callback", async (req: Request, res: Response) => {
  const clientID = `${appSettings.discord.clientId}`;
  const clientSecret = `${appSettings.discord.discordClientSecret}`;
  const redirectURI = "YOUR_REDIRECT_URI";

  const code = req.query.code as string;

  const tokenURL = "https://appleid.apple.com/auth/token";
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectURI,
    client_id: clientID,
    client_secret: clientSecret,
  });

  try {
    const response = await axios.post(tokenURL, params);
    const userToken = response.data.access_token;
    // Save the user token to a file or database for future use
    // You can also redirect the user to a success page or perform further actions
    res.send(`User Token: ${userToken}`);
  } catch (error: any) {
    console.error("Error obtaining user token:", error.response.data);
    res.send("Error obtaining user token. Please try again.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// discordRPC.register(clientID);

// const updateActivity = async () => {
//   if (!rpc) return;

//   rpc.setActivity({
//     details: "Apple Music",
//     state: "Listening to: ",
//     startTimestamp: new Date(),
//     largeImageKey: "apple_music_logo",
//     largeImageText: "Apple Music",
//     // buttons: [
//     //   { label: "Listen on Apple Music", url: "" },
//     //   { label: "View on Apple Music", url: "" },
//     // ],
//     instance: false,
//   });
// };

// rpc.on("ready", async () => {
//   updateActivity();
//   console.log("Discord RPC is ready and running!");

//   setInterval(() => {
//     updateActivity();
//   }, 120 * 1000); // Update every 15 seconds
// });

// rpc.login({ clientId: clientID }).catch((error: any) => console.log(error));
