const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// WebSocket接続時の処理
io.on("connection", (socket) => {
  console.log("A user connected");

  // クライアントからメッセージを受け取る処理
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    io.emit("chat message", msg); // 受け取ったメッセージを全クライアントに送信
  });

  // 切断時の処理
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// ポート番号の設定
const PORT = process.env.PORT || 3000;

// サーバー起動
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
