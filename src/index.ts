import express from "express";
import https from "https";
import fs from "fs";

// expressアプリケーションとHTTPサーバーの作成
const app = express();
const options = {
  key: fs.readFileSync("certs/server_key.pem"),
  cert: fs.readFileSync("certs/server_crt.pem"),
};
const server =
  process.env.SERVER_ENV === "dev"
    ? https.createServer(options, app)
    : https.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello, WebRTC Signaling Server!");
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on https://localhost:${PORT}`);
  console.log(`network https://192.168.1.15:${PORT}`);
});
