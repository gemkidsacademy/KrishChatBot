import { useState, useRef, useEffect } from "react";
import "./DemoChatbot.css";

export default function GuestChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState("simple");
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef(null);

  // Welcome message on first render
  useEffect(() => {
    const welcomeMsg = {
      sender: "bot",
      text: "Welcome! You are now in the Guest Chatbot. How can I assist you today?",
      links: [],
    };
    setMessages([welcomeMsg]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // Parse **bold** text
  const parseBoldText = (text) => {
    const regex = /\*\*(.+?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
    }
    return parts;
  };

  // Parse bold text and URLs
  const formatMessageWithLinks = (text) => {
    if (!text) return "";

    // convert **bold** to <strong>...</strong>
    let formatted = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // convert URLs to clickable links
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    return formatted;
  };

  // Handle submit (guest chatbot just echoes user input)
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!input.trim()) return;

  const userInput = input;
  setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
  setInput("");
  setIsWaiting(true);

  try {
    const response = await fetch(
      `https://krishbackend-production-9603.up.railway.app/guest-chatbot?query=${encodeURIComponent(
        userInput
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(`Backend returned status ${response.status}`);
    const data = await response.json();

    // Map backend response to frontend message format
    const botMessages = data.map((item) => ({
      sender: "bot",
      text: item.snippet || "No response",
      links: Array.isArray(item.links) ? item.links : [],
    }));

    setMessages((prev) => [...prev, ...botMessages]);
  } catch (error) {
    console.error(error);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Sorry, something went wrong while fetching the response.", links: [] },
    ]);
  } finally {
    setIsWaiting(false);
  }
};


  return (
    <div className="chat-container">
      {/* Background images */}
      <div className="bg-img bg-img-1"></div>
      <div className="bg-img bg-img-2"></div>
      <div className="bg-img bg-img-3"></div>
      <div className="bg-img bg-img-4"></div>

      <div className="chat-box">
        <div
          className="chat-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "8px",
            background: "linear-gradient(to right, #EC5125, #f97316)",
            padding: "0.75rem 1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "50%",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://gemkidsacademy.com.au/wp-content/uploads/2024/11/Frame-1707478212.svg"
              alt="Gem Kids Logo"
              style={{ width: "24px", height: "24px" }}
            />
          </div>
          <span style={{ color: "#fff", fontWeight: "bold" }}>Gem AI</span>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              {msg.sender === "bot" ? (
                <div dangerouslySetInnerHTML={{ __html: formatMessageWithLinks(msg.text) }} />
              ) : (
                <div>{msg.text}</div>
              )}
            </div>
          ))}
          {isWaiting && (
            <div className="message bot waiting">
              <div className="spinner"></div>
              <span>Waiting for response...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="reasoning-container">
            <label htmlFor="reasoning-select" className="reasoning-label">Reasoning</label>
            <select
              id="reasoning-select"
              value={reasoningLevel}
              onChange={(e) => setReasoningLevel(e.target.value)}
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button type="submit" disabled={isWaiting || !input.trim()}>
            {isWaiting ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
