import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import "./ChatBot.css"; // CSS للـ chat

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1️⃣ نضيف الرسالة للواجهة
    const userMsg = { type: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 2️⃣ نرسل الرسالة للـ backend
      const res = await api.post("/api/chat", { message: input });
      const botReply = { type: "bot", text: res.data.reply };

      // 3️⃣ نضيف الرد للبوت
      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error("Chatbot Error:", err.response?.data?.error || err.message);
      const errorMsg = { type: "bot", text: "Bot not available right now. Please try again later." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message-wrapper ${m.type}`}>
            <div className="avatar">
              {m.type === "bot" ? "G" : "U"}
            </div>
            <div className={`chat-msg ${m.type === "bot" ? "bot-msg" : "user-msg"}`}>
              <span className="msg-header">
                {m.type === "bot" ? "Glamora Assistant" : "You"}
              </span>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-wrapper bot">
            <div className="avatar">G</div>
            <div className="chat-msg bot-msg">Typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
