import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomeView from "./views/HomeView.tsx";
import BattleView from "./views/BattleView.tsx";
import ResultView from "./views/ResultView.tsx";

const App: React.FC = () => {
  // const [message, setMessage] = useState("");
  // const [messages, setMessages] = useState<string[]>([]);

  // useEffect(() => {
  //   // サーバーからメッセージを受け取った時の処理
  //   onMessageReceived((msg: string) => {
  //     setMessages((prevMessages) => [...prevMessages, msg]);
  //   });

  //   return () => {
  //     // クリーンアップ時にリスナーを解除
  //     // socket.off("chat message")はsocket.tsで実装する場合もあり
  //   };
  // }, []);

  // const handleSendMessage = () => {
  //   if (message.trim()) {
  //     sendMessage(message);
  //     setMessage("");
  //   }
  // };

  return (
    <Router>
      <Routes>
        <Route path="/battle/:roomId" element={<BattleView />} />
        <Route path="/result" element={<ResultView />} />
        <Route path="/" element={<HomeView />} />
      </Routes>
    </Router>
  );
};

export default App;
