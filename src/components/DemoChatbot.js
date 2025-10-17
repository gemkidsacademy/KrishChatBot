import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const [reasoningLevel, setReasoningLevel] = useState("simple");
const [isWaiting, setIsWaiting] = useState(false);
const chatEndRef = useRef(null);

useEffect(() => {
console.log("👨‍⚕️ doctorData received:", doctorData);
if (doctorData?.name) {
setMessages([
{
sender: "bot",
text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?`,
links: [],
},
]);
}
}, [doctorData?.name]);

useEffect(() => {
chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, isWaiting]);

useEffect(() => {
console.log("💬 Updated messages state:", messages);
}, [messages]);

if (!doctorData?.name) {
console.warn("⚠️ doctorData.name missing — redirecting to login");
return <Navigate to="/" replace />;
}

// ✅ Parse **bold** text correctly
const parseBoldText = (text) => {
const regex = /**(.+?)**/g;
const parts = [];
let lastIndex = 0;
let match;

```
while ((match = regex.exec(text)) !== null) {
  if (match.index > lastIndex) {
    parts.push(
      <span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>
    );
  }
  parts.push(<strong key={match.index}>{match[1]}</strong>);
  lastIndex = match.index + match[0].length;
}

if (lastIndex < text.length) {
  parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
}

return parts;
```

};

const handleSubmit = async (e) => {
e.preventDefault();
if (!input.trim()) return;

```
const userInput = input;
console.log("🧍User submitted:", userInput);

setMessages((prev) => [
  ...prev,
  { sender: "user", text: userInput, links: [] },
]);
setInput("");
setIsWaiting(true);

try {
  const url = `https://krishbackend-production.up.railway.app/search?query=${encodeURIComponent(
    userInput
  )}&reasoning=${reasoningLevel}&user_id=${encodeURIComponent(
    doctorData.name
  )}`;

  console.log("🌐 Fetching:", url);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Backend returned status ${response.status}`);
  }

  const data = await response.json();
  console.log("📦 Backend raw data:", data);

  if (!Array.isArray(data)) {
    throw new Error("Unexpected response format (expected array)");
  }

  const seenLinks = new Set();
  const links = [];

  const botText = data
    .map((pdf, index) => {
      console.log(`🔹 Processing item ${index}:`, pdf);
      const lines = [];
      const pdfName = pdf.name ? pdf.name : "Unknown Source";
      const snippet = pdf.snippet || "No snippet available.";

      lines.push(`${pdfName}: ${snippet}`);

      if (pdf.link && pdf.link.trim()) {
        console.log(`📄 Found link: ${pdf.link}`);
        if (!seenLinks.has(pdf.link)) {
          seenLinks.add(pdf.link);
          links.push(pdf.link);
        }
      }

      return lines.join("\n");
    })
    .join("\n\n");

  console.log("✅ Final links array:", links);
  console.log("🧠 Bot response text:", botText);

  setMessages((prev) => [
    ...prev,
    { sender: "bot", text: botText, links },
  ]);
} catch (error) {
  console.error("❌ Error fetching from backend:", error);
  setMessages((prev) => [
    ...prev,
    {
      sender: "bot",
      text: "Sorry, something went wrong while fetching results.",
      links: [],
    },
  ]);
} finally {
  setIsWaiting(false);
}
```

};

return ( <div className="chat-container"> <div className="chat-box"> <div className="chat-header">AI PDF Chatbot Demo</div>

```
    <div className="chat-messages">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.sender}`}>
          {msg.sender === "bot" ? (
            <>
              <div>{parseBoldText(msg.text)}</div>
              {Array.isArray(msg.links) && msg.links.length > 0 ? (
                <div className="pdf-links">
                  {console.log("🔗 Rendering PDF links:", msg.links)}
                  {msg.links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-link"
                    >
                      Open PDF
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "0.8em", color: "#777" }}>
                  (no links found)
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
```

);
}
