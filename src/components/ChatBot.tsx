import React, { useState, useRef, useEffect } from "react";
import "./ChatBot.css";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! 👋 I'm your portfolio assistant. Ask me anything about Sonu's experience, projects, or skills!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // Call backend API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: inputValue }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const retryAfterText =
          typeof data?.retryAfterSeconds === "number"
            ? ` Please try again in ${data.retryAfterSeconds} seconds.`
            : " Please try again shortly.";
        const fallbackText =
          response.status === 429
            ? `⚠️ Too many requests.${retryAfterText}`
            : "❌ Sorry, something went wrong. Please try again later.";

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data?.message || fallbackText,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || "Sorry, I couldn't generate a response.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "❌ Sorry, I couldn't reach the server. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`chat-button ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with portfolio assistant"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <video
            className="chat-bg-video"
            src="https://res.cloudinary.com/dentbtrzb/video/upload/v1775755311/285203_medium_faywrc.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="chat-bg-overlay" />

          <div className="chat-header">
            <h3>Portfolio Assistant</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === "user" ? "right" : "left"}`}
              >
                <div className="avatar" aria-hidden="true">
                  {message.sender === "user" ? "U" : "AI"}
                </div>
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="timestamp">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message left">
                <div className="avatar" aria-hidden="true">
                  AI
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about projects, skills, experience..."
              disabled={loading}
              className="chat-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              className="send-btn"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
