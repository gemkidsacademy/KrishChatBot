import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DemoChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [conversationUuid, setConversationUuid] = useState(() => crypto.randomUUID());
  const [reasoningLevel, setReasoningLevel] = useState("simple");
  
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showQuickTips, setShowQuickTips] = useState(false);

  const chatEndRef = useRef(null);
  const cleanMarkdownSpacing = (text) => {
    if (!text) return "";

    return text
      // collapse 3+ newlines into 2
      .replace(/\n{3,}/g, "\n\n")
      // trim extra spaces at start/end
      .trim();
  };

  const server =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://krishbackend-production-9603.up.railway.app";

  // ------------------ Auto-scroll ------------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // ------------------ Welcome message ------------------
  useEffect(() => {
  if (!doctorData?.name) return;

  const fetchWelcomeQuote = async () => {
    // Show welcome card immediately
    setMessages([
      {
        sender: "bot",
        type: "welcome",
        welcomeText: `Welcome, Dear ${doctorData.name}!`,
        quote: null,
        author: "",
        footer: "How can I assist you today?",
      },
    ]);

    setIsLoadingQuote(true);

    try {
      const response = await fetch(`${server}/welcome-quote`, {
        method: "POST",
      });

      if (response.ok) {
        const quoteData = await response.json();

        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.type === "welcome"
              ? {
                  ...msg,
                  quote: quoteData.quote,
                  author: quoteData.author,
                }
              : msg
          );

          const alreadyExists = updated.some(
            (msg) =>
              msg.sender === "bot" &&
              msg.text === "How can I assist you today?"
          );

          if (!alreadyExists) {
            updated.push({
              sender: "bot",
              text: "How can I assist you today?",
              name: "Gem AI",
              links: [],
            });
          }

          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  fetchWelcomeQuote();
}, [doctorData?.name, server]);

  // ------------------ Timer effect ------------------
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setMessages((prevMsg) => [
            ...prevMsg,
            { sender: "bot", text: "⏰ You should log in again." },
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
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!doctorData?.name) return <Navigate to="/" replace />;

  // ------------------ Helpers ------------------
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

  

  // ------------------ Handle submit ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTimeUp) return;

    const userInput = input.trim();

    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setInput("");
    setIsWaiting(true);

    try {
      const url = `${server}/search?query=${encodeURIComponent(
        userInput
      )}&reasoning=${encodeURIComponent(
        reasoningLevel
      )}&user_id=${encodeURIComponent(
        doctorData.name
      )}&conversation_uuid=${encodeURIComponent(
        conversationUuid
      )}&class_name=${encodeURIComponent(doctorData.class_name)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      

      const data = await response.json();

      let botMessage;

      if (Array.isArray(data)) {
        const firstItem = data[0] || {};
        botMessage = {
          sender: "bot",
          text: cleanMarkdownSpacing(
            firstItem.snippet || "Sorry, I couldn't generate a response."
          ),
          name: firstItem.name ? firstItem.name.replace(/\*\*/g, "") : "Gem AI",
          links: Array.isArray(firstItem.links) ? firstItem.links : [],
        };
      } else {
        botMessage = {
          sender: "bot",
          text: cleanMarkdownSpacing(
            data.answer_markdown || "Sorry, I couldn't generate a response."
          ),
          name: data.source_name || "Gem AI",
          links: Array.isArray(data.links) ? data.links : [],
          pdfs: Array.isArray(data.pdfs) ? data.pdfs : [],
        };
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot fetch error:", error);

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
  };

  return (
    <div className="chat-container">
      <div className="bg-img bg-img-1"></div>
      <div className="bg-img bg-img-2"></div>
      <div className="bg-img bg-img-3"></div>
      <div className="bg-img bg-img-4"></div>

      <div
        className="chat-box"
        style={{
          width: "82%",
          maxWidth: "1500px",
          margin: "20px auto",
        }}
      >
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-logo-wrap">
              <img
                src="https://gemkidsacademy.com.au/wp-content/uploads/2024/11/Frame-1707478212.svg"
                alt="Gem Kids Logo"
                className="chat-logo"
              />
            </div>
            <span className="chat-title">Gem AI Chatbot</span>
          </div>

          <div className="chat-header-right">
            <button
              type="button"
              className="quick-tips-btn"
              onClick={() => setShowQuickTips((prev) => !prev)}
            >
              💡 Quick Tips
            </button>
            <span className="chat-timer">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Quick Tips Overlay */}
        {/* Quick Tips Overlay */}
        {showQuickTips && (
          <div className="quick-tips-overlay">
            <div className="quick-tips-card">

              <div className="quick-tips-header">
                <div className="quick-tips-title">
                  💡 Quick Tips
                </div>

                <button
                  className="quick-tips-close"
                  onClick={() => setShowQuickTips(false)}
                  aria-label="Close Quick Tips"
                >
                  ×
                </button>
              </div>

              <div className="quick-tips-body">

                <div className="quick-tip-item">
                  <div className="quick-tip-icon">
                    💬
                  </div>

                  <div className="quick-tip-text">
                    <div className="quick-tip-heading">
                      1. Chatbot doesn't remember what is discussed above.
                    </div>

                    <div className="quick-tip-subtext">
                      Always provide context in every chat.
                    </div>
                  </div>
                </div>

                <div className="quick-tip-item">
                  <div className="quick-tip-icon">
                    ⚙️
                  </div>

                  <div className="quick-tip-text">
                    <div className="quick-tip-heading">
                      2. If you need elaborate response,
                    </div>

                    <div className="quick-tip-subtext">
                      please use the Reasoning dropdown on the bottom right.
                    </div>
                  </div>
                </div>
                <div className="usage-notice">

                  <div className="usage-notice-title">
                    ⚠️ Usage Notice
                  </div>

                  <div className="usage-notice-text">
                    Use <strong>Gem AI</strong> responsibly. Chats are monitored by
                    Gem Kids Academy administrators. Inappropriate use or abusive
                    language may lead to restricted access and escalation to parents.
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              {msg.sender === "bot" ? (
                  <>
  {msg.type === "welcome" ? (
    <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "28px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        border: "1px solid #ececec",
        marginBottom: "15px",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#222",
          marginBottom: "22px",
        }}
      >
        {msg.welcomeText}
      </div>

      <div
        style={{
          color: "#f97316",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          fontSize: "13px",
          marginBottom: "18px",
        }}
      >
        Quote of the Day
      </div>

      {msg.quote ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "5px",
              background: "#f97316",
              borderRadius: "6px",
              alignSelf: "stretch",
            }}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "22px",
                fontStyle: "italic",
                color: "#374151",
                lineHeight: "1.6",
              }}
            >
              “{msg.quote}”
            </div>

            <div
              style={{
                textAlign: "right",
                marginTop: "16px",
                color: "#6b7280",
                fontWeight: "500",
                fontSize: "18px",
              }}
            >
              — {msg.author}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "18px 0",
          }}
        >
          <div className="spinner"></div>

          <span
            style={{
              color: "#6b7280",
              fontStyle: "italic",
              fontSize: "18px",
            }}
          >
            Loading today's inspirational quote...
          </span>
        </div>
      )}

      
    </div>
  ) : (
    <>
          {msg.name && <div className="bot-label">{msg.name}</div>}

          <div className="bot-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.text}
            </ReactMarkdown>
          </div>

          {msg.pdfs && msg.pdfs.length > 0 ? (
              <div className="pdf-links">
                {msg.pdfs.map((pdf, index) => (
                  <div
                    key={index}
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      background: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: "6px",
                        wordBreak: "break-word",
                      }}
                    >
                      📄 {pdf.name}
                    </div>

                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-link"
                    >
                      Open PDF
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              msg.links.length > 0 && (
                <div className="pdf-links">
                  <a
                    href={msg.links[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdf-link"
                  >
                    Open PDF
                  </a>
                </div>
              )
            )}
        </>
      )}
    </>
                ) : (
                  <div>{msg.text}</div>
                )}
            </div>
          ))}
          {isLoadingQuote && (
            <div className="message bot waiting">
              <div className="spinner"></div>
              <span>Preparing today's quote...</span>
            </div>
          )}

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
            <label htmlFor="reasoning-select" className="reasoning-label">
              Reasoning
            </label>
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