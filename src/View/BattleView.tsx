import React, { useState } from "react";
import { Link } from "react-router-dom";

const BattleView: React.FC = () => {
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [remainingMessages, setRemainingMessages] = useState(10);
  const [remainingTime, setRemainingTime] = useState(60); // in seconds
  const [turnPlayer, setTurnPlayer] = useState("Player1");
  const [opponentName, setOpponentName] = useState("Opponent1");
  const [nextMessage, setNextMessage] = useState("");

  const handleSendMessage = () => {
    if (nextMessage.trim() !== "") {
      setChatLog([...chatLog, nextMessage]);
      setNextMessage("");
      // Implement message sending logic here
    }
  };

  const handleFinishMatching = () => {
    console.log("Finishing battle...");
    // Implement battle finish logic here
  };

  return (
    <div>
      <h1>対戦画面</h1>
      <div>
        <h2>チャットログ</h2>
        <ul>
          {chatLog.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
      <p>残りメッセージ数: {remainingMessages}</p>
      <p>このターンの残り時間: {remainingTime}秒</p>
      <p>ターンプレーヤー: {turnPlayer}</p>
      <p>相手のプレイヤーネーム: {opponentName}</p>
      <div>
        <label>
          次のメッセージ:
          <input
            type="text"
            value={nextMessage}
            onChange={(e) => setNextMessage(e.target.value)}
          />
        </label>
        <button onClick={handleSendMessage}>送信</button>
      </div>
      <Link to="/result">
        <button onClick={handleFinishMatching}>バトル終了</button>
      </Link>
    </div>
  );
};

export default BattleView;
