import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
  // ---------------- Hooks ----------------
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState("simple"); // default reasoning mode
  const chatEndRef = useRef(null);

  // ---------------- Effects ----------------
  useEffect(() => {
    if (doctorData?.name) {
      setMessages([
        { sender: "bot", text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?` },
      ]);
    }
  }, [doctorData?.name]);

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
      // Send reasoning level to backend
      const response = await fetch(
        `https://krishbackend-production.up.railway.app/search?query=${encodeURIComponent(
          userInput
        )}&reasoning=${reasoningLevel}`
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

        {/* Input + Reasoning Mode + Send */}
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
          <select
            value={reasoningLevel}
            onChange={(e) => setReasoningLevel(e.target.value)}
            style={{ padding: "8px", minWidth: "120px" }}
          >
            <option value="simple">Simple</option>
            <option value="medium">Medium</option>
            <option value="advanced">Advanced</option>
          </select>
          <button type="submit" style={{ padding: "8px 16px" }}>Send</button>
        </form>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
  // ---------------- Hooks ----------------
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState("simple"); // default reasoning mode
  const chatEndRef = useRef(null);

  // ---------------- Effects ----------------
  useEffect(() => {
    if (doctorData?.name) {
      setMessages([
        { sender: "bot", text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?` },
      ]);
    }
  }, [doctorData?.name]);

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
      // Send reasoning level to backend
      const response = await fetch(
        `https://krishbackend-production.up.railway.app/search?query=${encodeURIComponent(
          userInput
        )}&reasoning=${reasoningLevel}`
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

        {/* Input + Reasoning Mode + Send */}
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
          <select
            value={reasoningLevel}
            onChange={(e) => setReasoningLevel(e.target.value)}
            style={{ padding: "8px", minWidth: "120px" }}
          >
            <option value="simple">Simple</option>
            <option value="medium">Medium</option>
            <option value="advanced">Advanced</option>
          </select>
          <button type="submit" style={{ padding: "8px 16px" }}>Send</button>
        </form>
      </div>
    </div>
  );
}
