import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import socket, {
  sendMessage,
  onMessageReceived,
  onActivePlayerUpdate,
  onTurnCountUpdate,
  onBattleEnd,
} from "../socket";

const BattleView: React.FC = () => {
  const [chatLog, setChatLog] = useState<
    { senderId: string; message: string }[]
  >([]);
  const location = useLocation();
  const opponentId = location.state?.matchData.opponentId || "error";
  const opponentName = location.state?.matchData.opponentName || "error";
  const { roomId } = useParams<{ roomId: string }>();
  const [message, setMessage] = useState("");
  const [activePlayer, setActivePlayer] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(true); // 仮の状態
  const [turnCount, setTurnCount] = useState(0);
  const maxTurn = location.state?.matchData.battleConfig.maxTurn || 10;
  const oneTurnTime = location.state?.matchData.battleConfig.oneTurnTime || 60; // in seconds
  const [remainingTime, setRemainingTime] = useState(oneTurnTime);

  useEffect(() => {
    // メッセージ受信リスナーの登録
    const messageHandler = (data: { senderId: string; message: string }) => {
      // 送信者が相手プレイヤーだった場合のみチャットログを更新
      if (data.senderId === opponentId) {
        console.log(
          `Message received from opponent (${data.senderId}): ${data.message}`,
        );
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          { senderId: data.senderId, message: data.message }, // メッセージをオブジェクトとして保存
        ]);
      }
    };

    // メッセージ受信リスナーを登録
    socket.on("receiveMessage", messageHandler);

    // クリーンアップ関数でリスナーを解除
    return () => {
      socket.off("receiveMessage", messageHandler);
    };
  }, [opponentId]); // opponentId を依存関係に追加

  useEffect(() => {
    // ターン更新リスナー
    const turnHandler = (data: { currentTurn: string }) => {
      setActivePlayer(data.currentTurn);
      setIsMyTurn(data.currentTurn === socket.id); // 自分のターンかどうかをチェック
    };
    socket.on("turnUpdate", turnHandler);

    // クリーンアップ関数でリスナーを解除
    return () => {
      socket.off("turnUpdate", turnHandler);
    };
  }, []);

  useEffect(() => {
    // メッセージ数更新リスナー
    const messageCountHandler = (data: { messageCount: number }) => {
      setTurnCount(data.messageCount);
    };
    socket.on("messageCountUpdate", messageCountHandler);

    // クリーンアップ関数でリスナーを解除
    return () => {
      socket.off("messageCountUpdate", messageCountHandler);
    };
  }, []);

  useEffect(() => {
    // バトル終了リスナー
    const battleEndHandler = () => {
      alert("Battle Ended!");
    };
    socket.on("battleEnd", battleEndHandler);

    // クリーンアップ関数でリスナーを解除
    return () => {
      socket.off("battleEnd", battleEndHandler);
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && isMyTurn) {
      if (roomId) {
        sendMessage(roomId, message);
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          { senderId: socket.id || "unknown", message },
        ]); // 自分のメッセージをチャットログに追加
        setMessage("");
      } else {
        console.error("Room ID is undefined");
      }
    }
  };

  const handleFinishMatching = () => {
    console.log("Finishing battle...");
    // Implement battle finish logic here
  };

  return (
    <div>
      <h1>対戦画面</h1>
      <p>ルームID: {roomId}</p>
      <div>
        <h2>チャットログ</h2>
        <ul>
          {chatLog.map((message, index) => (
            <li key={index}>{message.message}</li>
          ))}
        </ul>
      </div>
      <p>残りメッセージ数: {maxTurn - turnCount}</p>
      <p>このターンの残り時間: {remainingTime}秒</p>
      <p>ターンプレーヤー: {activePlayer === socket.id ? "あなた" : "相手"}</p>
      <p>相手のプレイヤーネーム: {opponentName}</p>
      <div>
        <label>
          メッセージ:
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <button onClick={handleSendMessage} disabled={!isMyTurn}>
          {isMyTurn ? "送信" : "Wait for your turn"}
        </button>
      </div>
      <Link to="/result">
        <button onClick={handleFinishMatching}>バトル終了</button>
      </Link>
    </div>
  );
};

export default BattleView;
