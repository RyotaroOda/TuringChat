import React, { useState, useEffect } from "react";
import { sendMessage, onMessageReceived } from "./socket";

const App: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // サーバーからメッセージを受け取った時の処理
    onMessageReceived((msg: string) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      // クリーンアップ時にリスナーを解除
      // socket.off("chat message")はsocket.tsで実装する場合もあり
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message); // メッセージを送信
      setMessage(""); // 送信後に入力欄をクリア
    }
  };

  return (
    <div>
      <h1>Chat App</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default App;
