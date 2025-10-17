import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState("simple");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const messagesRef = useRef([]); // track messages during typing

  // ---------------- Effects ----------------
  useEffect(() => {
    if (doctorData?.name) {
      const welcome = { sender: "bot", text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?` };
      setMessages([welcome]);
      messagesRef.current = [welcome];
    }
  }, [doctorData?.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!doctorData?.name) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input;
    const userMsg = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMsg]);
    messagesRef.current = [...messagesRef.current, userMsg];
    setInput("");
    setIsTyping(true);

    try {
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

      const botMsg = { sender: "bot", text: "" };
      messagesRef.current = [...messagesRef.current, botMsg];
      setMessages(messagesRef.current);

      // Typewriter effect using ref
      let index = 0;
      const interval = setInterval(() => {
        if (index < botText.length) {
          botMsg.text += botText.charAt(index);
          setMessages([...messagesRef.current]); // force re-render
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20);

      // Clear interval if component unmounts
      return () => clearInterval(interval);

    } catch (error) {
      console.error("Error fetching from backend:", error);
      const errorMsg = { sender: "bot", text: "Sorry, something went wrong while fetching results." };
      setMessages((prev) => [...prev, errorMsg]);
      messagesRef.current = [...messagesRef.current, errorMsg];
      setIsTyping(false);
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

          {isTyping && (
            <div className="message bot typing">
              Bot is typing<span className="blinking-cursor">|</span>
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

          <button type="submit" style={{ padding: "8px 16px" }}>Send</button>
        </form>
      </div>
    </div>
  );
}
