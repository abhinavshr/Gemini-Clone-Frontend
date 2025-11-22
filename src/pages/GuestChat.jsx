import { useState, useRef, useEffect } from "react";
import "../styles/chat.css";
import { Link } from "react-router-dom";

function GuestChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;
    setInput("");

    try {
      const res = await fetch("https://php-laravel-docker-7znh.onrender.com/api/guest-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();

      if (res.status === 403) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.message || "Daily message limit reached." },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "No reply" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Server error. Try again later." },
      ]);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-card">

        {/* Header */}
        <div className="chat-header">
          <h2>Guest Chat</h2>
          <div className="auth-links">
            <Link to="/login">Login</Link>
            <span>|</span>
            <Link to="/register">Register</Link>
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-history">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}>
              <span>{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input Box */}
        <div className="input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage} className="send-btn">
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default GuestChat;
