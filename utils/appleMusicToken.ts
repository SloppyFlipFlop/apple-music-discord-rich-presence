import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

import appSettings from "./../config/appSettings";

const privateKeyPath = path.join(__dirname, "./AuthKey_D6T3T86PX3.p8");
const privateKey = fs.readFileSync(privateKeyPath, "utf-8").toString();
const teamId = appSettings.appleMusic.teamId;
const keyId = "D6T3T86PX3";

const appleMusicDevToken = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: teamId,
  header: {
    alg: "ES256",
    kid: keyId,
  },
});

export default appleMusicDevToken;
