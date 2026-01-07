import io from "socket.io-client";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";
const SERVER_URL =
  process.env.SERVER_ENV === "dev"
    ? `https://${HOST}:${PORT}`
    : `https://production-server:${PORT}`; // サーバーのURLとポートを指定

const socket = io(`${SERVER_URL}`, {
  secure: true,
  rejectUnauthorized: false, // 自己署名証明書を許可する場合
});

socket.on("connect", () => {
  console.log("サーバに接続成功:", socket.id);
});

socket.emit("join-room", { roomId: "test-room", userId: "test-user" });
socket.emit("signal", {
  userId: "test-user",
  targetId: "mock-socket-1",
  signal: "example-signal!",
});

socket.on("user-joined", (userId: string) => {
  console.log("新しいユーザーが参加しました:", userId);
});
socket.on("user-disconnected", (userId: string) => {
  console.log("ユーザーが退出しました:", userId);
});
socket.on("existing-members", (members: any[]) => {
  console.log("既存メンバーリストを受信しました:", members);
});
socket.on(
  "signal",
  ({ userId, signal }: { userId: string; signal: string }) => {
    console.log("シグナルを受信しました:", userId, signal);
  }
);

socket.on("disconnect", () => {
  console.log("サーバから切断されました");
});
