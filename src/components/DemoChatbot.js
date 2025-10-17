import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState("simple");
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize welcome message
  useEffect(() => {
    if (doctorData?.name) {
      setMessages([
        { sender: "bot", text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?` }
      ]);
    }
  }, [doctorData?.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  if (!doctorData?.name) {
    return <Navigate to="/" replace />;
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input;
    setMessages(prev => [...prev, { sender: "user", text: userInput }]);
    setInput("");
    setIsWaiting(true);

    try {
      const response = await fetch(
        `https://krishbackend-production.up.railway.app/search?query=${encodeURIComponent(
          userInput
        )}&reasoning=${reasoningLevel}`
      );
      const data = await response.json();

      // Prepare bot message and links
      const botLines = [];
      data.forEach(pdf => {
        const snippet = pdf.snippet || "No snippet available.";
        botLines.push(`${pdf.name}: ${snippet}`);

        // Handle multiple links
        if (Array.isArray(pdf.links)) {
          pdf.links.forEach(linkObj => {
            if (linkObj?.url) {
              botLines.push(`[Open PDF](${linkObj.url})`);
            }
          });
        } else if (pdf.link) {
          // Handle single link
          botLines.push(`[Open PDF](${pdf.link})`);
        }
      });

      const botText = botLines.join("\n");

      setMessages(prev => [...prev, { sender: "bot", text: botText }]);
    } catch (error) {
      console.error("Error fetching from backend:", error);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong while fetching results." }
      ]);
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {/* Header */}
        <div className="chat-header">AI PDF Chatbot Demo</div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              {msg.sender === "bot" ? (
                msg.text.split("\n").map((line, i) =>
                  line.startsWith("[Open PDF]") ? (
                    <div key={i}>
                      <a
                        href={line.match(/\((.*?)\)/)[1]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-link"
                      >
                        Open PDF
                      </a>
                    </div>
                  ) : (
                    <div key={i}>{parseBoldText(line)}</div>
                  )
                )
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

        {/* Input + Reasoning + Send */}
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
