import dotenv from "dotenv";
dotenv.config();

const appSettings = {
  port: process.env.PORT || 3000,

  appleMusic: {
    teamId: process.env.APPLE_DEV_TEAM_ID,
    keyId: process.env.APPLE_MUSIC_KEY_ID,
    privateKey: process.env.APPLE_MUSIC_PRIVATE_KEY,
    clientSecret: process.env.CLIENT_SERCET,
  },

  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
  },
};

export default appSettings;
