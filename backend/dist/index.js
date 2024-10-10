"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
const battleConfig = {
    maxTurn: 6 * 2,
    battleType: "single",
    oneTurnTime: 60, // 1ターンの制限時間
    //TODO: ChatTopic
};
const battleLog = {
    currentTurn: 0,
    messages: [],
    activePlayer: null,
};
const battleRooms = {};
// 待機プレイヤーの配列
let waitingPlayers = []; //待機リスト
// WebSocket接続時の処理
io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);
    // プレイヤーネームをクライアントから受信する
    socket.on("savePlayerName", (name) => {
        socket.data.playerName = name; // プレイヤーの名前をSocketインスタンスに保存
    });
    // マッチングリクエスト
    socket.on("requestMatch", () => {
        console.log("Player requesting to join match:", socket.id);
        // 待機中のプレイヤーがいない場合
        if (waitingPlayers.length === 0) {
            waitingPlayers.push(socket); //待機リストに追加
            console.log("No available players, waiting...");
        }
        else {
            const player1 = waitingPlayers.pop();
            const player2 = socket;
            const roomId = (0, uuid_1.v4)(); // ユニークなIdを生成
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
    socket.on("sendMessage", (data) => {
        var _a, _b;
        const { roomId, message } = data;
        // ルーム情報を取得
        const battleRoom = battleRooms[roomId];
        if (!battleRoom) {
            console.error("Room not found:", roomId);
            return;
        }
        // メッセージをバトルログに追加
        (_a = battleRoom.battleLog) === null || _a === void 0 ? void 0 : _a.messages.push({
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
        if (((_b = battleRoom.battleLog) === null || _b === void 0 ? void 0 : _b.currentTurn) >= battleRoom.battleConfig.maxTurn) {
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
