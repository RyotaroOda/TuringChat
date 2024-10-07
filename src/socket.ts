import { io, Socket } from "socket.io-client";

// サーバーとの接続を作成
const socket: Socket = io("http://localhost:3000", {
  transports: ["websocket"], // 必要に応じて設定
});

// サーバーとの接続状態をログに出力
socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// メッセージを送信
export const sendMessage = (roomId: string, message: string) => {
  socket.emit("sendMessage", { roomId, message });
};

// サーバーからメッセージを受け取るリスナー
export const onMessageReceived = (callback: (message: string) => void) => {
  socket.on("receiveMessage", callback);
};

//マッチングリクエストを送信
export const requestMatch = () => {
  socket.emit("requestMatch");
};

//プレイヤー名を設定
export const savePlayerName = (playerName: string) => {
  socket.emit("savePlayerName", playerName);
};

//マッチング成功時の処理
export const onMatchFound = (
  callback: (data: {
    roomId: string;
    opponentId: string;
    opponentName: string;
  }) => void,
) => {
  socket.on("matchFound", callback);
};

// ターン更新リスナー
export const onActivePlayerUpdate = (
  callback: (data: { activePlayer: string }) => void,
) => {
  socket.on("activePlayerUpdate", callback);
};

// メッセージ数更新リスナー
export const onTurnCountUpdate = (
  callback: (data: { messageCount: number; maxMessages: number }) => void,
) => {
  socket.on("turnCountUpdate", callback);
};

// バトル終了リスナー
export const onBattleEnd = (callback: (data: { roomId: string }) => void) => {
  socket.on("battleEnd", callback);
};

export default socket;
