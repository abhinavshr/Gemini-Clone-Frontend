import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your AI assistant" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/ai/chat", {
        message: userMessage.text,
      });

      const botMessage = {
        sender: "bot",
        text: response.data.reply || "No response",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to AI" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">Gemini AI Chat</header>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}

        {loading && <div className="message bot">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
