import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState("simple");
  const [isWaiting, setIsWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // adjust as needed
  const chatEndRef = useRef(null);

  // ------------------ Auto-scroll ------------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // ------------------ Welcome message ------------------
  useEffect(() => {
    if (doctorData?.name) {
      setMessages([
        {
          sender: "bot",
          text: `Welcome, Dear ${doctorData.name}! How can I assist you today?`,
          links: [],
        },
      ]);
    }
  }, [doctorData?.name]);

  // ------------------ Timer effect ------------------
  useEffect(() => {
    if (timeLeft <= 0) return; // stop if already zero

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Append message safely
          setMessages(prevMsg => [
            ...prevMsg,
            { sender: "bot", text: "⏰ You should log in again." }
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const isTimeUp = timeLeft === 0;

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2,"0")}:${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
  };

  if (!doctorData?.name) return <Navigate to="/" replace />;

  // ------------------ Helpers ------------------
  const parseBoldText = (text) => {
    const regex = /\*\*(.+?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
    return parts;
  };

  const formatMessageWithLinks = (text) => {
    if (!text) return "";
    let formatted = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    return formatted;
  };

  // ------------------ Handle submit ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTimeUp) return;

    const userInput = input;
    setMessages(prev => [...prev, { sender: "user", text: userInput }]);
    setInput("");
    setIsWaiting(true);

    try {
      const url = `https://krishbackend-production-9603.up.railway.app/search?query=${encodeURIComponent(
        userInput
      )}&reasoning=${encodeURIComponent(reasoningLevel)}&user_id=${encodeURIComponent(
        doctorData.name
      )}&class_name=${encodeURIComponent(doctorData.class_name)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Backend returned status ${response.status}`);
      const data = await response.json();

      const processedMessages = data.map(item => ({
        sender: "bot",
        text: item.snippet,
        name: item.name,
        links: Array.isArray(item.links) ? item.links : []
      }));

      setMessages(prev => [...prev, ...processedMessages]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong while fetching results.", links: [] }
      ]);
    } finally {
      setIsWaiting(false);
    }
  };

  // ------------------ Render ------------------
  return (
    <div className="chat-container">
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
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            background: "linear-gradient(to right, #EC5125, #f97316)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ backgroundColor: "#fff", borderRadius: "50%", padding: "4px" }}>
              <img
                src="https://gemkidsacademy.com.au/wp-content/uploads/2024/11/Frame-1707478212.svg"
                alt="Gem Kids Logo"
                style={{ width: "24px", height: "24px" }}
              />
            </div>
            <span style={{ color: "#fff", fontWeight: "bold" }}>Gem AI</span>
          </div>
          <span style={{ color: "#fff", fontWeight: "bold" }}>{formatTime(timeLeft)}</span>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              {msg.sender === "bot" ? (
                <>
                  {msg.name && <div className="bot-label">{parseBoldText(msg.name)}</div>}
                  <div dangerouslySetInnerHTML={{ __html: formatMessageWithLinks(msg.text) }} />
                  {msg.links.length > 0 && (
                    <div className="pdf-links">
                      <a href={msg.links[0]} target="_blank" rel="noopener noreferrer" className="pdf-link">
                        Open PDF
                      </a>
                    </div>
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

        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTimeUp}
          />
          <div className="reasoning-container">
            <label htmlFor="reasoning-select" className="reasoning-label">Reasoning</label>
            <select
              id="reasoning-select"
              value={reasoningLevel}
              onChange={(e) => setReasoningLevel(e.target.value)}
              disabled={isTimeUp}
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button type="submit" disabled={isWaiting || !input.trim() || isTimeUp}>
            {isWaiting ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
