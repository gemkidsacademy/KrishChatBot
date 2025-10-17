import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState("simple");
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef(null);

  // ------------------ Welcome message ------------------
  useEffect(() => {
    console.log("👨‍⚕️ doctorData received:", doctorData);
    if (doctorData?.name) {
      const welcomeMsg = {
        sender: "bot",
        text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?`,
        links: [],
      };
      console.log("💬 Setting initial message:", welcomeMsg);
      setMessages([welcomeMsg]);
    }
  }, [doctorData?.name]);

  // ------------------ Auto-scroll ------------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  if (!doctorData?.name) {
    console.warn("⚠️ doctorData.name missing — redirecting to login");
    return <Navigate to="/" replace />;
  }

  // ------------------ Parse **bold** text ------------------
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

  // ------------------ Handle user submit ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log("🧍 User submitted:", input);
    setMessages((prev) => [...prev, { sender: "user", text: input, links: [] }]);
    setInput("");
    setIsWaiting(true);

    try {
      const url = `https://krishbackend-production.up.railway.app/search?query=${encodeURIComponent(
        input
      )}&reasoning=${encodeURIComponent(reasoningLevel)}&user_id=${encodeURIComponent(
        doctorData.name
      )}`;

      console.log("🌐 Fetching backend with URL:", url);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Backend returned status ${response.status}`);

      const data = await response.json();
      console.log("📦 Backend raw data:", data);

      // ------------------ Process backend response ------------------
      const links = [];
      const botTextLines = [];

      data.forEach((item, idx) => {
        console.log(`🔹 Processing item ${idx}:`, item);
        const snippet = item.snippet || "No snippet available.";
        botTextLines.push(`${item.name}: ${snippet}`);

        if (Array.isArray(item.links)) {
          item.links.forEach((linkObj, linkIdx) => {
            if (linkObj?.url) {
              links.push({
                name: linkObj.name || item.name,
                url: linkObj.url,
                page: linkObj.page || 1,
              });
              console.log(`   ➕ Added link #${linkIdx}:`, linkObj);
            }
          });
        } else if (item.link && typeof item.link === "string") {
          links.push({
            name: item.name,
            url: item.link,
            page: item.page || 1,
          });
          console.log("   ➕ Added single link:", item.link);
        }
      });

      console.log("✅ Final links array:", links);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botTextLines.join("\n"), links },
      ]);
    } catch (error) {
      console.error("❌ Error fetching from backend:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong while fetching results.", links: [] },
      ]);
    } finally {
      setIsWaiting(false);
      console.log("⏹️ handleSubmit complete, isWaiting=false");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="chat-header">AI PDF Chatbot Demo</div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              {msg.sender === "bot" ? (
                <>
                  <div>{parseBoldText(msg.text)}</div>
                  {Array.isArray(msg.links) && msg.links.length > 0 ? (
                    <div className="pdf-links">
                      {msg.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-link"
                        >
                          {link.name} (Page {link.page})
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.8em", color: "#777" }}>(no links found)</div>
                  )}
                </>
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

        <form
          onSubmit={handleSubmit}
          className="chat-input"
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1, padding: "8px" }}
          />
          <div className="reasoning-container">
            <label htmlFor="reasoning-select" className="reasoning-label">
              Reasoning
            </label>
            <select
              id="reasoning-select"
              value={reasoningLevel}
              onChange={(e) => setReasoningLevel(e.target.value)}
              className="reasoning-select"
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button type="submit" style={{ padding: "8px 16px" }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
