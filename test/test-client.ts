import io from "socket.io-client";

console.log("Starting test client...");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";
const SERVER_URL = `https://signal.tacotacokun.com`;

const socket = io(SERVER_URL); // URLをそのまま渡すだけでOK

socket.on("connect_error", (err) => {
  console.error("接続エラー:", err.message);
});

socket.on("connect", () => {
  console.log("サーバに接続成功:", socket.id);
});

socket.emit("join-room", { roomId: "production-room", userId: "test-user" });
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
  },
);
socket.on("offer", ({ socketId, sdp }: { socketId: string; sdp: any }) => {
  console.log("offerを受信しました:", socketId, sdp);
  // モックのAnswerを作成して返信
  const mockAnswerSdp = {
    type: "answer",
    sdp: "v=0\r\no=- 1234567890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=msid-semantic: WMS\r\n", // ダミーのSDP文字列
  };

  console.log(`Answerを返信します -> targetId: ${socketId}`);

  socket.emit("answer", {
    socketId: socketId,
    sdp: mockAnswerSdp,
  });
});

socket.on("disconnect", () => {
  console.log("サーバから切断されました");
});
