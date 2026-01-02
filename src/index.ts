import express from "express";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";

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
const io = new Server(server);

// 部屋とユーザーの管理用オブジェクト
const rooms: { [roomId: string]: any[] } = {};
const userMap: { [socketId: string]: string } = {}; // socketId(key)とuserIdのマッピング

// Socket.IOの接続イベントの処理
io.on("connection", (socket) => {
  console.log("socket通信が開始されました。", socket.id);
  socket.on("join-room", (data: { roomId: string; userId: string }) => {
    console.log("join-room", socket.id);
    // ユーザーを部屋に追加
    userMap[socket.id] = data.userId;
    socket.join(data.roomId);
    if (!rooms[data.roomId]) {
      rooms[data.roomId] = [];
    }
    rooms[data.roomId]!.push({ socketId: socket.id, userId: data.userId });

    // デバッグ:現在のユーザーリストをコンソールに表示
    showUserMap();

    // 部屋にいる他のユーザーに通知
    socket.to(data.roomId).emit("user-joined", socket.id);

    // 切断イベントの処理
    socket.on("disconnect", () => {
      console.log("socket通信が終了しました。", socket.id);

      // ユーザーを部屋から削除
      delete userMap[socket.id];
      if (rooms[data.roomId]) {
        const index = rooms[data.roomId]!.findIndex(
          (user) => user.socketId === socket.id
        );
        if (index !== -1) {
          rooms[data.roomId]!.splice(index, 1);
        }
        // 空になった部屋を削除
        if (rooms[data.roomId]!.length === 0) {
          delete rooms[data.roomId];
        }
      }
      socket.to(data.roomId).emit("user-disconnected", socket.id);
    });
  });
});

const showUserMap = () => {
  console.log("現在の接続ユーザ\n");
  console.log(userMap);
  console.log(rooms);
};

// ルートエンドポイントの設定
app.get("/", (req, res) => {
  res.send("Hello, WebRTC Signaling Server!");
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on https://localhost:${PORT}`);
  console.log(`network https://192.168.1.15:${PORT}\n`);
});
