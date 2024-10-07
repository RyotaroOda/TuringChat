const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const { v4: uuidv4 } = require("uuid");

let waitingPlayers = []; //待機リスト

//WebSocket接続時の処理
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  //マッチングリクエスト
  socket.on("requestMatch", () => {
    console.log("Player requesting to join match:", socket.id);

    //待機中のプレイヤーがいない場合
    if (waitingPlayers.length === 0) {
      waitingPlayers.push(socket); //待機リストに追加
      console.log("No available players, waiting...");
      // 待機中のプレイヤーがいる場合はマッチングを成立させる
    } else {
      const player1 = waitingPlayers.pop();
      const player2 = socket;
      const roomId = uuidv4(); // ユニークなIdを生成

      // 両プレイヤーを部屋に入れる
      player1.join(roomId);
      player2.join(roomId);

      // マッチング成立を通知
      player1.emit("matchFound", { roomId, opponentId: player2.id });
      player2.emit("matchFound", { roomId, opponentId: player1.id });

      console.log("Matched between players:", player1, player2);
    }
  });

  // 切断時に待機中のリストから削除
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    waitingPlayers = waitingPlayers.filter((player) => player.id !== socket.id);
  });
});

// ポート番号の設定
const PORT = process.env.PORT || 3000;

// サーバー起動
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
