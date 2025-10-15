import React, { useState, useEffect } from "react";
import { marked } from "marked";
import './Ai_Learning.css';

const Ai_Learning = ({ doctorData }) => {
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [question_text, setQuestionText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setQuestionText("");
  }, [marks]);

  const questionsData = {
  sociology: {
    4: [
      "Explain two features of a laboratory experiment and how they are used to test hypotheses in sociology.",
      "Describe two types of qualitative interview.",
      "Describe two ways children learn about gender identity.",
      "Describe two ways increased life expectancy may impact upon the family.",
      "Describe two ways social policies may impact upon the family.",
      "Describe two ways childhood is a distinct period from adulthood.",
      "Describe two ways schools can be seen as feminised."
    ],
    6: [
      "Explain two strengths of using unstructured interviews in sociological research.",
      "Using sociological material, give one argument against the view that the peer group is the most important influence in shaping age identity.",
      "Explain two strengths of using content analysis in sociological research.",
      "‘Education is the most important influence in shaping class identity.’ Using sociological material, give one argument against this view.",
      "Explain two strengths of using laboratory experiments in sociological research.",
      "‘Inadequate socialisation is the main cause of deviant behaviour.’",
      "Explain one strength and one limitation of liberal feminist views of the family.",
      "‘Social class is the most important factor affecting the experiences of children in the family.’ Using sociological material, give one argument against this view.",
      "Explain one strength and one limitation of postmodernist views on family diversity.",
      "Explain two strengths of functionalist views of the family."
    ],
    8: [
      "Explain two reasons why some social groups are difficult to study.",
      "Explain two ethical factors to consider when conducting observational studies.",
      "Explain two reasons why unstructured interviews are high in validity.",
      "Explain two reasons for greater gender equality in some families.",
      "Explain two reasons why fewer people are getting married.",
      "Explain two functions the family performs to benefit its members.",
      "Explain two ways racism can affect attainment in schools."
    ],
    10: [
      "The peer group is the most important influence in shaping age identity. Explain this view.",
      "‘Education is the most important influence in shaping class identity.’ Explain this view.",
      "‘Inadequate socialisation is the main cause of deviant behaviour.’",
      "‘Social class is the most important factor affecting the experiences of children in the family.’ Explain this view.",
      "‘The main role of the family is to benefit society.’ Explain this view.",
      "‘There is no longer any social pressure on people to get married.’ Explain this view."
    ],
    12: [
      "IQ tests are a fair measure of educational ability. Using sociological material, give two arguments against this view."
    ],
    26: [
      "Evaluate the view that female identity is very different from fifty years ago.",
      "Evaluate the use of structured interviews in sociological research.",
      "Evaluate the view that human behaviour is shaped by nurture rather than nature.",
      "Evaluate the positivist view that sociologists should use a scientific approach to research.",
      "Evaluate the view that the family is the most important agent of socialisation in shaping identity.",
      "Evaluate the view that sociological research can be value-free.",
      "Evaluate the view that the main role of the family is to promote capitalist ideology.",
      "Evaluate the view that marriage has become less important in society.",
      "Evaluate the view that roles in the family are still based on traditional gender identities.",
      "Evaluate the view that the nuclear family is the dominant family type.",
      "Evaluate the view that cultural differences are the main cause of family diversity.",
      "Evaluate the view that parenthood today is different from the past.",
      "Evaluate the view that education contributes to value consensus."
    ]
  }
};
  const handleRefresh = () => {
    setSubject("");
    setMarks("");
    setQuestionText("");
    setUserInput("");
    setChatLog([]);
    setSessionId(null);
    setIsStartingConversation(false);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    if (!sessionId) return alert("Please start a conversation first!");
    if (!doctorData || !doctorData.id || !doctorData.name) return alert("Doctor info missing!");

    const payload = {
      session_id: sessionId,
      message: userInput,
      id: doctorData.id,
      username: doctorData.name,
      subject: subject,
    };

    try {
      setIsSending(true);
      const response = await fetch(
        "https://usefulapis-production.up.railway.app/send_message_anz_way_model_evaluation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setChatLog(prev => [
        ...prev,
        { sender: "user", text: userInput },
        { sender: "bot", text: data.reply || "No response from server" },
      ]);
      setUserInput("");
    } catch (error) {
      alert("⚠️ Failed to get response from the tutor.");
    } finally {
      setIsSending(false);
    }
  };

  const handleStartConversation = async () => {
    if (!subject || !marks || !question_text) return alert("Please fill all fields!");

    try {
      setIsStartingConversation(true);
      const response = await fetch(
        "https://usefulapis-production.up.railway.app/chat_anz_way_model_evaluation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            marks,
            question_text,
            username: doctorData.name,
          }),
        }
      );

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      if (data.session_id) setSessionId(data.session_id);

      setChatLog([{ sender: "bot", text: data.reply || "No response from server" }]);
    } catch (error) {
      setChatLog([{ sender: "bot", text: "⚠️ Failed to reach server." }]);
    } finally {
      setIsStartingConversation(false);
    }
  };

  return (
    <div className="container">
      {/* Left Panel: Dropdowns and Buttons */}
      <div className="panel left-panel">
        <h3>Start Chat</h3>

        <div className="form-row">
          <div className="form-group flex-grow">
            <label htmlFor="subjectSelect">Subject:</label>
            <select
              id="subjectSelect"
              value={subject}
              onChange={e => { setSubject(e.target.value); setMarks(""); setQuestionText(""); }}
              className="image-select"
            >
              <option value="">-- Select Subject --</option>
              <option value="sociology">Sociology</option>
              <option value="economics">Economics</option>
              <option value="history">History</option>
              <option value="political_science">Political Science</option>
              <option value="literature">Literature</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="marksInput">Marks:</label>
            <select
              id="marksInput"
              value={marks}
              onChange={e => { setMarks(e.target.value); setQuestionText(""); }}
              className="image-select"
            >
              <option value="">-- Select Marks --</option>
              {subject && Object.keys(questionsData[subject] || {}).map(mark => (
                <option key={mark} value={mark}>{mark}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="questionSelect">Question:</label>
          <select
            id="questionSelect"
            value={question_text}
            onChange={e => setQuestionText(e.target.value)}
            className="image-select"
          >
            <option value="">-- Select a valid subject and marks --</option>
            {subject && marks && questionsData[subject][marks]?.map((q, idx) => (
              <option key={idx} value={q}>{q}</option>
            ))}
          </select>
        </div>

        <div className="left-buttons">
          <button
            onClick={handleStartConversation}
            className={`train-btn ${isStartingConversation ? "processing" : ""}`}
            disabled={isStartingConversation}
          >
            {isStartingConversation ? "Starting..." : "Start Conversation"}
          </button>
          <button onClick={handleRefresh} className="remove-btn">Refresh</button>
        </div>
      </div>

      {/* Right Panel: Chat */}
      <div className="panel right-panel">
        <div className="chat-box">
          {chatLog.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender}`}>
              <div
                className="chat-bubble"
                dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
              />
            </div>
          ))}
        </div>

        <div className="form-row">
          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Type your message..."
            rows={1}
            className="image-select"
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
            onPaste={e => e.preventDefault()}
            onCopy={e => e.preventDefault()}
          />
          <button
            onClick={handleSend}
            className="train-btn"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ai_Learning;
