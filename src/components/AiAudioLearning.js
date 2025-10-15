import React, { useState, useEffect, useRef } from "react";
import './AiAudioLearning.css';

 
const AiAudioLearning = ({ doctorData }) => {
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [question_text, setQuestionText] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [audioSrc, setAudioSrc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStartingConversation, setIsStartingConversation] = useState(false);


  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Reset question when marks change
  useEffect(() => setQuestionText(""), [marks]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatLog]);

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
  // Refresh page
  const handleRefresh = () => {
   // Reset form inputs
   setSubject("");
   setMarks("");
   setQuestionText("");
 
   // Reset session and conversation states
   setSessionId(null);
   setChatLog([]);
   setMessages([]);
   setAudioSrc(null);
   setIsRecording(false);
   setIsStartingConversation(false);
 
   // Reset refs
   if (mediaRecorderRef.current) {
     mediaRecorderRef.current.stop?.();
     mediaRecorderRef.current = null;
   }
   audioChunksRef.current = [];
   if (audioRef.current) {
     audioRef.current.pause();
     audioRef.current.currentTime = 0;
     audioRef.current.src = "";
   }
 
   // Scroll chat window to top
   if (chatWindowRef.current) {
     chatWindowRef.current.scrollTop = 0;
   }
 
   console.log("[DEBUG] All inputs, chat, audio, and recording state cleared. Ready for a fresh session.");
 };


  // Start conversation
  const handleStartConversation = async () => {
  // Validate required fields
  if (!subject || !marks || !question_text) {
    alert("⚠️ Please fill in all fields before starting the conversation.");
    return;
  }

  try {
    setIsStartingConversation(true); // show "Starting..." on button

    const payload = {
      subject,
      marks,
      question_text: question_text,
      username: doctorData?.name || "Guest",
    };

    console.log("[DEBUG] Starting conversation with payload:", payload);

    const response = await fetch(
      "https://usefulapis-production.up.railway.app/chat_anz_way_model_evaluation_audio",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);

    const data = await response.json();
    console.log("[DEBUG] Conversation started, backend response:", data);

    // Save session ID
    if (data.session_id) setSessionId(data.session_id);

    // Add initial bot text reply
    if (data.text_reply) {
      setChatLog((prev) => [...prev, { sender: "bot", text: data.text_reply }]);
    }

    // Poll for audio if session exists
    if (data.session_id) {
      const interval = setInterval(async () => {
        try {
          const audioRes = await fetch(
            `https://usefulapis-production.up.railway.app/get-audio/${data.session_id}`
          );

          if (!audioRes.ok) throw new Error(`Audio fetch error: ${audioRes.statusText}`);
          const audioData = await audioRes.json();

          if (audioData.audio_ready && audioData.audio_base64) {
            clearInterval(interval);

            const src = `data:audio/mp3;base64,${audioData.audio_base64}`;
            setAudioSrc(src);

            if (audioRef.current && audioRef.current.src !== src) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              audioRef.current.src = src;
              audioRef.current.play().catch((e) => console.error("⚠️ Audio play error:", e));
            }
          }
        } catch (err) {
          console.error("❌ Error fetching audio:", err);
          clearInterval(interval);
        }
      }, 2000);
    }
  } catch (error) {
    console.error("❌ Error starting conversation:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setIsStartingConversation(false); // reset button state
  }
};


  // Voice recording
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = handleSendAudio;
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send recorded audio
  const handleSendAudio = async () => {
    if (!sessionId || !doctorData) {
      alert("Start a conversation first!");
      return;
    }

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("session_id", sessionId);
      formData.append("username", doctorData.name);
      formData.append("id", doctorData.id);

      console.log("🚀 Sending audio:", { size: audioBlob.size, type: audioBlob.type });

      const response = await fetch(
        "https://usefulapis-production.up.railway.app/send_audio_message",
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      if (data.audio_url) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = data.audio_url;
        await audioRef.current.play();
      }

      if (data.reply) {
       setChatLog(prev => [
         ...prev,
         { sender: "bot", text: data.reply }
       ]);
     }


      console.log("📝 Transcription / response:", data);
    } catch (error) {
      console.error("❌ Error sending audio:", error);
      alert("Failed to send audio message.");
    }
  };

  return (
    <div className="chat-container">
      {/* Controls */}
      <div className="controls">
        {/* Subject Dropdown */}
        <div className="control-item">
          <label htmlFor="subjectSelect">Subject:</label>
          <select
            id="subjectSelect"
            value={subject}
            onChange={(e) => {
              const selected = e.target.value;
              setSubject(selected);
              setMarks("");
              setQuestionText("");
            }}
          >
            <option value="">-- Select Subject --</option>
            <option value="sociology">Sociology</option>
            <option value="economics">Economics</option>
            <option value="history">History</option>
            <option value="political_science">Political Science</option>
            <option value="literature">Literature</option>
          </select>
        </div>

        {/* Marks Dropdown */}
        <div className="control-item">
          <label htmlFor="marksInput">Marks:</label>
          <select
            id="marksInput"
            value={marks}
            onChange={(e) => {
              const selectedMarks = e.target.value;
              setMarks(selectedMarks);
              setQuestionText("");
            }}
          >
            <option value="">-- Select Marks --</option>
            {subject &&
              Object.keys(questionsData[subject] || {}).map((markValue) => (
                <option key={markValue} value={markValue}>
                  {markValue}
                </option>
              ))}
          </select>
        </div>

        {/* Question Dropdown */}
        <div className="control-item flex-grow">
          <label htmlFor="questionSelect">Question:</label>
          <select
            id="questionSelect"
            value={question_text}
            onChange={(e) => setQuestionText(e.target.value)}
          >
            <option value="">
              -- Select a valid subject and marks to see the list of questions --
            </option>
            {subject &&
              marks &&
              questionsData[subject]?.[marks]?.map((q, idx) => (
                <option key={idx} value={q}>
                  {q}
                </option>
              ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="buttons">
          <button
            className={`start-btn ${isStartingConversation ? "disabled" : ""}`}
            onClick={handleStartConversation}
            disabled={isStartingConversation}
          >
            {isStartingConversation ? "Starting..." : "Start"}
          </button>
          <button className="refresh-btn" onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-window" ref={chatWindowRef}>
        {chatLog.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === "user" ? "user-msg" : "ai-msg"
            }`}
          >
            {msg.sender === "user" ? "🧑 " : "🤖 "} {msg.text}
          </div>
        ))}
      </div>

      {/* Voice Assistant */}
      <div className="voice-assistant">
        <div className="voice-title">Talk to AI Tutor</div>
        <button
          className={`voice-btn ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          <div className="voice-inner-circle" />
          {isRecording && <div className="pulse-circle" />}
        </button>
        <audio ref={audioRef} controls src={audioSrc || ""} className="audio-player" />
      </div>
    </div>
  );
};

export default AiAudioLearning;
