import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState("simple");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingIntervalRef = useRef(null); // track interval

  // ---------------- Effects ----------------
  useEffect(() => {
    if (doctorData?.name) {
      const welcome = { sender: "bot", text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?` };
      setMessages([welcome]);
    }
  }, [doctorData?.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Clear typing interval on unmount
  useEffect(() => {
    return () => clearInterval(typingIntervalRef.current);
  }, []);

  if (!doctorData?.name) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input;
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
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

      // Add empty bot message
      setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

      let index = 0;
      typingIntervalRef.current = setInterval(() => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          newMessages[newMessages.length - 1] = { ...lastMessage, text: lastMessage.text + botText.charAt(index) };
          return newMessages;
        });
        index++;
        if (index >= botText.length) {
          clearInterval(typingIntervalRef.current);
          setIsTyping(false);
        }
      }, 20);

    } catch (error) {
      console.error("Error fetching from backend:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong while fetching results." },
      ]);
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
