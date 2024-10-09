import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import socket, { sendMessage } from "../socket";

interface MatchData {
  myId: string;
  opponentId: string;
  opponentName: string;
  battleConfig: {
    maxTurn: number;
    oneTurnTime: number;
  };
}

interface LocationState {
  myData: {
    playerName: string;
  };
  matchData: MatchData;
}

const BattleView: React.FC = () => {
  const [chatLog, setChatLog] = useState<
    { senderId: string; message: string }[]
  >([]);
  const location = useLocation();
  const myName = location.state?.myData.playerName + "(あなた)" || "error";
  const myId = socket.id || "error";
  const opponentId = location.state?.matchData.opponentId || "error";
  const opponentName = location.state?.matchData.opponentName || "error";
  const { roomId } = useParams<{ roomId: string }>();
  const [message, setMessage] = useState<string>("");
  const [isMyTurn, setIsMyTurn] = useState<boolean>(true); // 仮の状態
  const [turnCount, setTurnCount] = useState<number>(0);
  const maxTurn = location.state?.matchData.battleConfig.maxTurn || 10;
  const oneTurnTime = location.state?.matchData.battleConfig.oneTurnTime || 60; // in seconds
  const [remainingTime, setRemainingTime] = useState<number>(oneTurnTime);

  // プレイヤーIDとネームの対応を保存
  const playerNames: { [key: string]: string } = {
    [opponentId]: opponentName,
    [myId as string]: myName,
  };

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
    const turnHandler = (data: any) => {
      // setIsMyTurn(data.activePlayer === socket.id); // 自分のターンかどうかをチェック
      setTurnCount(data.currentTurn);
    };
    socket.on("turnUpdate", turnHandler);

    // クリーンアップ関数でリスナーを解除
    return () => {
      socket.off("turnUpdate", turnHandler);
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
          { senderId: myId as string, message: message }, // メッセージをオブジェクトとして保存
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
          {chatLog.map((msg, index) => (
            <li key={index}>
              {/* IDからプレイヤーネームを判別して表示 */}
              <strong>{playerNames[msg.senderId] || "Unknown"}:</strong>{" "}
              {msg.message}
            </li>
          ))}
        </ul>
      </div>
      <p>残りメッセージ数: {maxTurn - turnCount}</p>
      <p>このターンの残り時間: {remainingTime}秒</p>
      <p>ターンプレーヤー: {isMyTurn ? "あなた" : "相手"}</p>
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
