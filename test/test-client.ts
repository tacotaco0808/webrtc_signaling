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
socket.on("disconnect", () => {
  console.log("サーバから切断されました");
});
