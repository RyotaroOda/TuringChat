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
  const [chatLog, setChatLog] = useState<string[]>([]);
  const location = useLocation();
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
    // サーバーからメッセージを受け取った時の処理
    onMessageReceived((data) => {
      setChatLog((prevChatLog) => [...prevChatLog, data.message]);
    });

    //ターン更新時
    onActivePlayerUpdate((data) => {
      setActivePlayer(data.activePlayer);
      setIsMyTurn(data.activePlayer === socket.id); //自分のターンかどうか
    });

    //ターン数更新時
    onTurnCountUpdate((data) => {
      setTurnCount(data.messageCount);
    });

    //バトル終了時
    onBattleEnd((data) => {
      alert("バトル終了");
      console.log("Battle ended with roomId:", data.roomId);
      // Implement battle end logic here
    });

    return () => {
      // クリーンアップ時にリスナーを解除
      // socket.off("chat message")はsocket.tsで実装する場合もあり
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && isMyTurn) {
      if (roomId) {
        sendMessage(roomId, message);
        setChatLog((prevChatLog) => [...prevChatLog, message]); // 自分のメッセージをチャットログに追加
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
            <li key={index}>{message}</li>
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
