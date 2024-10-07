const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const { v4: uuidv4 } = require("uuid");

// バトル設定データを生成
const battleConfig = {
  maxTurn: 6 * 2, // 最大ターン数
  battleType: "single", // バトルタイプ
  oneTurnTime: 60, // 1ターンの制限時間
  //TODO: ChatTopic
};

let waitingPlayers = []; //待機リスト

//WebSocket接続時の処理
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  // プレイヤーネームをクライアントから受信する
  socket.on("savePlayerName", (name) => {
    socket.playerName = name; // プレイヤーの名前をSocketインスタンスに保存
  });

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
      player1.emit("matchFound", {
        roomId,
        opponentId: player2.id,
        opponentName: player2.playerName,
        battleConfig,
      });
      player2.emit("matchFound", {
        roomId,
        opponentId: player1.id,
        opponentName: player1.playerName,
        battleConfig,
      });

      console.log("Matched between players:", player1, player2);

      // ゲーム開始
      let activePlayer = player1.id; //TODO:ランダムにする
      let turnCount = 0;

      io.to(roomId).emit("activePlayerUpdate", { activePlayer });
      io.to(roomId).emit("turnCountUpdate", { turnCount });

      // メッセージ受信処理
      //socket.on("sendMessage", (data) => {
      //   const { roomId, message } = data;
      //   console.log("index message", message);
      //   //ターンプレイヤーが自分であることを確認
      //   if (socket.id !== activePlayer) {
      //     turnCount++;
      //     io.to(roomId).emit("receiveMessage", {
      //       message,
      //       senderId: socket.id,
      //     });

      //     // ターンプレイヤーの切り替え
      //     activePlayer = activePlayer === player1.id ? player2.id : player1.id;
      //     io.to(roomId).emit("activePlayerUpdate", { activePlayer });
      //     io.to(roomId).emit("turnCountUpdate", { turnCount });

      //     //ターン上限に達した場合
      //     if (turnCount >= battleConfig.maxTurn) {
      //       io.to(roomId).emit("battleEnd", { roomId });
      //       return;
      //     }
      //   }
      // });
    }
  });

  // **メッセージ送信処理**: sendMessageイベントが発火したときの動作を定義
  socket.on("sendMessage", (data) => {
    const { roomId, message } = data;
    console.log(`Message received in room ${roomId}: ${message}`);

    // メッセージを同じルーム内のすべてのクライアントにブロードキャスト
    io.to(roomId).emit("receiveMessage", {
      message,
      senderId: socket.id,
    });
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
