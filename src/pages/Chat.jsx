import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/mainchat.css";

export default function Chat() {
    const nav = useNavigate();
    const [msg, setMsg] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const bottomRef = useRef(null);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const send = async () => {
        if (!msg.trim()) return;
        setLoading(true);

        try {
            const res = await API.post("/chat", { message: msg });
            setHistory((prev) => [...prev, { user: msg, bot: res.data.reply }]);
            setMsg("");
        } catch (err) {
            console.error(err);
            const status = err?.response?.status;

            if (status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
                nav("/");
            } else {
                alert("Chat failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await API.post("/logout");
        // eslint-disable-next-line no-unused-vars, no-empty
        } catch (e) {}

        localStorage.removeItem("token");
        nav("/");
    };

    return (
        <div className="chat-page">
            <div className="chat-card">

                {/* Header */}
                <div className="chat-header">
                    <h2>AI Assistant</h2>
                    <button className="logout-btn" onClick={logout}>
                        Logout
                    </button>
                </div>

                {/* Chat History */}
                <div className="chat-history">
                    {history.map((m, i) => (
                        <div key={i} className="msg-wrapper">

                            {/* USER MESSAGE — Right */}
                            <div className="msg user-msg">
                                <span>{m.user}</span>
                            </div>

                            {/* BOT MESSAGE — Left */}
                            <div className="msg bot-msg">
                                <span>{m.bot}</span>
                            </div>

                        </div>
                    ))}

                    <div ref={bottomRef}></div>
                </div>

                {/* Input Area */}
                <div className="input-area">
                    <textarea
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="Type a message..."
                        rows={3}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                    />

                    <button
                        className="send-btn"
                        onClick={send}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}
