import io from "socket.io-client";

const PORT = Number(process.env.PORT) || 3000;
const SERVER_URL =
  process.env.SERVER_ENV === "dev"
    ? `https://localhost:${PORT}`
    : `https://production-server:${PORT}`; // サーバーのURLとポートを指定

const socket = io(`${SERVER_URL}`, {
  secure: true,
  rejectUnauthorized: false, // 自己署名証明書を許可する場合
});

socket.on("connect", () => {
  console.log("サーバに接続成功:", socket.id);
});

socket.emit("join-room", { roomId: "test-room", userId: "test-user" });

socket.on("user-joined", (userId: string) => {
  console.log("新しいユーザーが参加しました:", userId);
});
socket.on("user-disconnected", (userId: string) => {
  console.log("ユーザーが退出しました:", userId);
});

socket.on("disconnect", () => {
  console.log("サーバから切断されました");
});
