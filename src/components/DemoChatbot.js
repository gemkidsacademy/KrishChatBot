import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
  // ---------------- Hooks ----------------
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningMode, setReasoningMode] = useState(false); // Reasoning mode toggle
  const chatEndRef = useRef(null);

  // ---------------- Effects ----------------
  // Set welcome message after doctorData is available
  useEffect(() => {
    if (doctorData?.name) {
      setMessages([
        { sender: "bot", text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?` },
      ]);
    }
  }, [doctorData?.name]);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- Redirect if no doctor data ----------------
  if (!doctorData?.name) {
    return <Navigate to="/" replace />;
  }

  // ---------------- Handlers ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input;
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setInput("");

    try {
      // Send reasoningMode along with the query
      const response = await fetch(
        `https://krishbackend-production.up.railway.app/search?query=${encodeURIComponent(
          userInput
        )}&reasoning=${reasoningMode}`
      );
      const data = await response.json();

      const botText = data
        .map((pdf) =>
          pdf.link
            ? `${pdf.name}: ${pdf.snippet}\n[Open PDF](${pdf.link})`
            : `${pdf.name}: ${pdf.snippet}`
        )
        .join("\n\n");

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (error) {
      console.error("Error fetching from backend:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong while fetching results." },
      ]);
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="chat-container">
      <div className="chat-box">
        {/* Header */}
        <div className="chat-header">
          AI PDF Chatbot Demo
          <div className="reasoning-toggle">
            <label>
              <input
                type="checkbox"
                checked={reasoningMode}
                onChange={(e) => setReasoningMode(e.target.checked)}
              />
              Reasoning Mode
            </label>
          </div>
        </div>

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
                    <div key={i}>{line}</div>
                  )
                )
              ) : (
                <div>{msg.text}</div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
