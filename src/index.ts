import express from "express";
import http from "http";

// expressアプリケーションとHTTPサーバーの作成
const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello, WebRTC Signaling Server!");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
