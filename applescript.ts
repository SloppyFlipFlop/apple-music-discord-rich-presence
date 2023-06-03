const applescript = require("applescript");
const { execString } = applescript;

const script = `tell application "Music" to tell artwork 1 of current track return data end tell`;

import { tmpdir } from "os";
import { writeFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import { promisify } from "util";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "drl5uagby",
  api_key: "728439761536159",
  api_secret: "7xnCSU3JQA-Q6D1LeQyvg-rH02c",
});

let artworkUploaded = false;
let artworkURL = null as string | null;
let currentSong = null as string | null;

const getArtwork = async (song: string): Promise<string | null> => {
  if (currentSong !== song) {
    artworkUploaded = false;
    artworkURL = null;
    currentSong = song;
  }

  if (artworkUploaded) {
    // Artwork already uploaded, return the URL
    return artworkURL;
  }

  return new Promise((resolve, reject) => {
    execString(script, async function (err: any, artwork: any) {
      if (err) {
        // Something went wrong!
        console.log(err);
        return artworkURL;
      }

      const tempDir = tmpdir();
      const tempFilePath = join(tempDir, "artwork.png");

      try {
        // Create temp image file
        writeFileSync(tempFilePath, artwork, "base64");

        // Upload image to Cloudinary
        const upload = promisify(cloudinary.uploader.upload);

        type OptionsType = {
          use_filename: boolean;
          folder: string;
        };

        const options = {
          use_filename: true as boolean,
          folder: "apple-music-rich-presence" as string,
        };

        const src = (await upload(tempFilePath)) as any;

        artworkURL = src.secure_url;
        artworkUploaded = true;
        resolve(artworkURL);
      } catch (error) {
        console.error("Error uploading the image:", error);
        reject(error);
      } finally {
        // Delete temp file
        try {
          if (existsSync(tempFilePath)) {
            unlinkSync(tempFilePath);
          }
        } catch (deleteError) {
          console.error("Error deleting the temp file:", deleteError);
        }
      }
    });
  });
};

const handleSongChange = async () => {};

const extractSongData = async (): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    execString(
      `tell application "Music" to tell artwork 1 of current track return data end tell`,
      function (err: any, artwork: any) {
        if (err) {
          // Something went wrong!
          console.log(err);
        }
        execString(
          `tell application "Music" to get properties of current track`,
          async (err: any, song: any) => {
            let songObj: any = {};
            song.forEach((s: any) => {
              if (typeof s === "string") {
                let [key, value] = s.split(":");
                songObj[key] = value ? value.split('"').join("") : null;
                // log
              }
              // console.log(songObj);
            });

            resolve({
              artworkURL: getArtwork(songObj.name),
              song: songObj.name,
              endTimestamp: parseInt(songObj.duration),
              artist: songObj.artist,
              album: songObj.album,
            });
          }
        );
      }
    );
  });
};

export { extractSongData };
