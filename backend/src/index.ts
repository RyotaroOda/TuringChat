import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

// Socketインターフェースにカスタムデータ型を追加
interface CustomSocket extends Socket {
  data: {
    playerName?: string;
  };
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // 必要に応じてCORS設定
    methods: ["GET", "POST"],
  },
});
// バトル設定データを生成
interface BattleConfig {
  maxTurn: number;
  battleType: string;
  oneTurnTime: number;
}

const battleConfig: BattleConfig = {
  maxTurn: 6 * 2, // 最大ターン数
  battleType: "single", // バトルタイプ
  oneTurnTime: 60, // 1ターンの制限時間
  //TODO: ChatTopic
};

// バトルログ
interface BattleLog {
  currentTurn: number;
  messages: Array<{ senderId: string; message: string }>;
  activePlayer: string | null;
}

const battleLog: BattleLog = {
  currentTurn: 0,
  messages: [],
  activePlayer: null,
};

// ルーム情報を保持するオブジェクト
interface BattleRoom {
  roomId: string | null;
  player1: string | null;
  player2: string | null;
  battleConfig: BattleConfig | null;
  battleLog: BattleLog | null;
}

const battleRooms: { [key: string]: BattleRoom } = {};

// 待機プレイヤーの配列
let waitingPlayers: Socket[] = []; //待機リスト

// WebSocket接続時の処理
io.on("connection", (socket: Socket) => {
  console.log("A player connected:", socket.id);

  // プレイヤーネームをクライアントから受信する
  socket.on("savePlayerName", (name: string) => {
    socket.data.playerName = name; // プレイヤーの名前をSocketインスタンスに保存
  });

  // マッチングリクエスト
  socket.on("requestMatch", () => {
    console.log("Player requesting to join match:", socket.id);

    // 待機中のプレイヤーがいない場合
    if (waitingPlayers.length === 0) {
      waitingPlayers.push(socket); //待機リストに追加
      console.log("No available players, waiting...");
    } else {
      const player1 = waitingPlayers.pop() as Socket;
      const player2 = socket;
      const roomId = uuidv4(); // ユニークなIdを生成

      // ルーム固有の情報
      battleRooms[roomId] = {
        roomId,
        player1: player1.id,
        player2: player2.id,
        battleConfig,
        battleLog,
      };

      // 両プレイヤーを部屋に入れる
      player1.join(roomId);
      player2.join(roomId);

      // マッチング成立を通知
      player1.emit("matchFound", {
        roomId,
        myId: player1.id,
        opponentId: player2.id,
        opponentName: player2.data.playerName,
        battleConfig,
      });
      player2.emit("matchFound", {
        roomId,
        opponentId: player1.id,
        opponentName: player1.data.playerName,
        battleConfig,
      });

      console.log("Matched between players:", player1.id, player2.id);
    }
  });

  // メッセージ送信
  socket.on("sendMessage", (data: { roomId: string; message: string }) => {
    const { roomId, message } = data;

    // ルーム情報を取得
    const battleRoom = battleRooms[roomId];
    if (!battleRoom) {
      console.error("Room not found:", roomId);
      return;
    }

    // メッセージをバトルログに追加
    battleRoom.battleLog?.messages.push({
      senderId: socket.id,
      message,
    });

    // ターン更新
    if (battleRoom.battleLog) {
      battleRoom.battleLog.currentTurn += 1;
      battleRoom.battleLog.activePlayer =
        battleRoom.battleLog.activePlayer === battleRoom.player1
          ? battleRoom.player2
          : battleRoom.player1;
    }

    // ターン上限に達した場合
    if (
      battleRoom.battleLog &&
      battleRoom.battleConfig &&
      battleRoom.battleLog.currentTurn >= battleRoom.battleConfig.maxTurn
    ) {
      io.to(roomId).emit("battleEnd", { roomId });
      return;
    }

    // メッセージを同じルーム内のすべてのクライアントにブロードキャスト
    io.to(roomId).emit("receiveMessage", {
      message,
      senderId: socket.id,
    });

    io.to(roomId).emit("turnUpdate", { battleRoom });
  });

  // プレイヤーが切断したときの処理
  socket.on("disconnect", () => {
    // プレイヤーが待機中のリストにいたら削除
    waitingPlayers = waitingPlayers.filter((player) => player.id !== socket.id);
    console.log("Player disconnected:", socket.id);
  });
});

// ポート番号の設定
const PORT = process.env.PORT || 3000;

// サーバー起動
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
