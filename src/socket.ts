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

// メッセージをサーバーに送信する関数
export const sendMessage = (message: string) => {
  socket.emit("chat message", message);
};

// サーバーからメッセージを受け取るリスナー
export const onMessageReceived = (callback: (message: string) => void) => {
  socket.on("chat message", callback);
};

//マッチングリクエストを送信
export const requestMatch = () => {
  socket.emit("requestMatch");
};

//マッチング成功時の処理
export const onMatchFound = (
  callback: (data: { roomId: string; opponentId: string }) => void,
) => {
  socket.on("matchFound", callback);
};

export default socket;
