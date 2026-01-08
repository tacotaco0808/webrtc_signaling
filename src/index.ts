import express from "express";
import http from "http";
import fs from "fs";
import { Server } from "socket.io";

// expressアプリケーション
const app = express();

// nginxを使う場合は通常のHTTPサーバーとして動作
const server = http.createServer(app);
const io = new Server(server);

// 部屋とユーザーの管理用オブジェクト
const rooms: { [roomId: string]: any[] } = {};
const userMap: { [socketId: string]: string } = {}; // socketId(key)とuserIdのマッピング

// モックデータ
const userMapMock: { [socketId: string]: string } = {
  "mock-socket-1": "user-alice",
  "mock-socket-2": "user-bob",
  "mock-socket-3": "user-charlie",
};

const roomsMock: { [roomId: string]: any[] } = {
  "test-room": [
    { socketId: "mock-socket-1", userId: "user-alice" },
    { socketId: "mock-socket-2", userId: "user-bob" },
  ],
  lobby: [{ socketId: "mock-socket-3", userId: "user-charlie" }],
};

// Socket.IOの接続イベントの処理
io.on("connection", (socket) => {
  console.log("socket通信が開始されました。", socket.id);
  socket.on("join-room", (data: { roomId: string; userId: string }) => {
    console.log("join-room", socket.id);

    // 既存の部屋メンバーリストを取得（参加前）
    const existingMembers = rooms[data.roomId] || [];

    // ユーザーを部屋に追加
    userMap[socket.id] = data.userId;
    socket.join(data.roomId);
    if (!rooms[data.roomId]) {
      rooms[data.roomId] = [];
    }
    rooms[data.roomId]!.push({ socketId: socket.id, userId: data.userId });

    // デバッグ:現在のユーザーリストをコンソールに表示
    showUserMap();

    // 新規参加者に既存メンバーリストを送信
    socket.emit("existing-members", existingMembers);
    console.log("既存メンバーリストを送信:", existingMembers);

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
  // Offer送信
  socket.on("offer", ({ targetId, sdp }: { targetId: string; sdp: any }) => {
    console.log("offer from", socket.id, "to", targetId);
    if (userMap[targetId]) {
      io.to(targetId).emit("offer", { userId: socket.id, sdp });
      console.log("offerを送信しました:", targetId);
    } else {
      console.log("ターゲットのソケットが見つかりません:", targetId);
    }
  });

  // Answer送信
  socket.on("answer", ({ targetId, sdp }: { targetId: string; sdp: any }) => {
    console.log("answer from", socket.id, "to", targetId);
    if (userMap[targetId]) {
      io.to(targetId).emit("answer", { userId: socket.id, sdp });
      console.log("answerを送信しました:", targetId);
    } else {
      console.log("ターゲットのソケットが見つかりません:", targetId);
    }
  });

  // ICE Candidate送信
  socket.on(
    "ice-candidate",
    ({ targetId, candidate }: { targetId: string; candidate: any }) => {
      console.log("ice-candidate from", socket.id, "to", targetId);
      if (userMap[targetId]) {
        io.to(targetId).emit("ice-candidate", {
          userId: socket.id,
          candidate,
        });
        console.log("ice-candidateを送信しました:", targetId);
      } else {
        console.log("ターゲットのソケットが見つかりません:", targetId);
      }
    }
  );
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
