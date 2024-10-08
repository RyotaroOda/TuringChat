import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestMatch, onMatchFound, savePlayerName } from "../socket";

interface MyData {
  playerName: string;
  playerScore: number;
  aiPrompt: string;
}

const HomeView: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [playerScore, setPlayerScore] = useState<number>(9999);
  const [aiPrompt, setAiPrompt] = useState<string>("Input AI prompt here");

  const handleStartMatching = (): void => {
    console.log("Starting random matching...");
    // Implement random matching logic here
  };

  const [isMatching, setIsMatching] = useState<boolean>(false);
  const navigate = useNavigate();

  const myData: MyData = {
    playerName,
    playerScore,
    aiPrompt,
  };

  const startMatch = (): void => {
    const nameToSave = playerName === "" ? "ゲスト" : playerName;
    setPlayerName(nameToSave);
    savePlayerName(nameToSave);
    setIsMatching(true);
    requestMatch();

    //マッチング成功時のバトル画面へ遷移
    onMatchFound((data) => {
      console.log("Match found with opponent:", data.opponentId);
      navigate(`/battle/${data.roomId}`, {
        state: { matchData: data, myData },
      });
      setIsMatching(false);
    });
  };

  return (
    <div>
      <h1>ホーム</h1>
      <p>PlayerName: {playerName}</p>
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <p>Score: {playerScore}</p>
      <div>
        <label>
          AIプロンプト:
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
        </label>
      </div>
      <button onClick={startMatch} disabled={isMatching}>
        {isMatching ? "Matching..." : "Start Matching"}
      </button>
    </div>
  );
};

export default HomeView;
