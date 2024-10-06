import React, { useState } from "react";
import { Link } from "react-router-dom";

const HomeView: React.FC = () => {
  const [playerName, setPlayerName] = useState("ゲスト");
  const [playerScore, setPlayerScore] = useState(9999);
  const [aiPrompt, setAiPrompt] = useState("Input AI prompt here");

  const handleStartMatching = () => {
    console.log("Starting random matching...");
    // Implement random matching logic here
  };

  return (
    <div>
      <h1>ホーム</h1>
      <p>PlayerName: {playerName}</p>
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
      <Link to="/battle">
        <button onClick={handleStartMatching}>バトル開始</button>
      </Link>
    </div>
  );
};

export default HomeView;
