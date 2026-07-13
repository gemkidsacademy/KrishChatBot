import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// --- Components ---

import AdminPanel from "./components/AdminPage";

//import AddDoctor from "./components/AddDoctorPage";
//import EditDoctor from "./components/EditDoctorPage";
//import ViewDoctors from "./components/ViewDoctors";
//import DeleteDoctor from "./components/DeleteDoctor";
import DemoChatbot from "./components/DemoChatbot";
import UsageDashboard from "./components/UsageDashboard";
import ChatbotSettings from "./components/ChatbotSettings";
import GuestChatbot from "./components/GuestChatbot";
import StudentPdfViewer from "./components/StudentPdfViewer";


// ----------------- Login Page -----------------
function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0); // seconds left
  const [error, setError] = useState(null);
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMode, setLoginMode] = useState("otp_only"); 
  const [settingsLoading, setSettingsLoading] = useState(true);
  const allowOtpLogin = loginMode === "otp_only" || loginMode === "both";
  const allowIdLogin = loginMode === "id_only" || loginMode === "both";


  // NEW
  const [loginMethod, setLoginMethod] = useState("otp");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const server =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://krishbackend-production-9603.up.railway.app";
      useEffect(() => {
  setError(null);

  if (loginMethod === "otp") {
    setStudentId("");
    setPassword("");
  }

  if (loginMethod === "id") {
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setTimer(0);
  }
}, [loginMethod]);
  // ---------- OTP Timer ----------
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);
  const handleIdLogin = async () => {
  if (isLoggingIn) return;

  if (!studentId.trim()) {
    setError("Enter Student ID");
    return;
  }

  if (!password.trim()) {
    setError("Enter Password");
    return;
  }

  setIsLoggingIn(true);
  setError(null);

  try {
    const res = await fetch(`${server}/login-GemKidsAcademyChatbot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: studentId.trim(),
        password: password.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.detail || "Login failed");
      setIsLoggingIn(false);
      return;
    }

    setDoctorData(data.user);
    setIsLoggedIn(true);
    setSessionToken(null);

    const role = (data.user.role || "").toUpperCase();

    if (role.includes("ADMIN")) {
      navigate("/AdminPanel");
    } else {
      navigate("/ChatBot");
    }

  } catch (err) {
    console.error(err);
    setError("Login failed");
    setIsLoggingIn(false);
  }
};
useEffect(() => {
  const fetchLoginSettings = async () => {
    try {
      const res = await fetch(`${server}/chatbot-login-settings`);

      if (!res.ok) {
        throw new Error("Failed to fetch chatbot login settings");
      }

      const data = await res.json();

      const mode = data.login_mode || "otp_only";
      setLoginMode(mode);

      // Set default selected tab based on what is enabled
      if (mode === "otp_only") {
        setLoginMethod("otp");
      } else if (mode === "id_only") {
        setLoginMethod("id");
      } else {
        setLoginMethod("otp"); // default when both are enabled
      }
    } catch (err) {
      console.error(err);
      // fallback so login page still works
      setLoginMode("otp_only");
      setLoginMethod("otp");
    } finally {
      setSettingsLoading(false);
    }
  };

  fetchLoginSettings();
}, []);
  // ---------- Generate OTP ----------
  const generateOtp = async () => {
    if (!email.trim()) return setError("Enter email");

    const formattedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formattedEmail)) return setError("Invalid email");

    try {
      const res = await fetch(`${server}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formattedEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setError(null);
        
        setTimer(300); // 5 minutes countdown
      } else {
        setError(data.detail || "Failed to generate OTP");
      }
    } catch (err) {
      setError("Server error while generating OTP");
    }
  };

  // ---------- Handle OTP Login ----------
  const handleLogin = async (e) => {
  e.preventDefault();

  if (isLoggingIn) return;
  setIsLoggingIn(true);
  setError(null);

  if (!otpSent) {
    await generateOtp();
    setIsLoggingIn(false);
    return;
  }

  if (!otp.trim()) {
    setError("Enter OTP");
    setIsLoggingIn(false);
    return;
  }

  try {
    const res = await fetch(`${server}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        otp: otp.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.detail || "Invalid OTP");
      setIsLoggingIn(false);
      return;
    }

    if (!data.user) {
      setError("Missing user data");
      setIsLoggingIn(false);
      return;
    }

    setDoctorData(data.user);
    setIsLoggedIn(true);
    setSessionToken(null);

    // Check whether the user is an admin
    const role = (data.user.role || "").toUpperCase();

    if (role.includes("ADMIN")) {
      navigate("/AdminPanel");
    } else {
      navigate("/ChatBot");
    }

  } catch (err) {
    console.error(err);
    setError("Login failed. Try again.");
    setIsLoggingIn(false);
  }
};

  return (
  <div style={{ 
      ...styles.container,
      flexDirection: "column" // ensures logo appears above
  }}>

    {/* ⭐ LOGO ABOVE LOGIN CARD ⭐ */}
    <img
      src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
      alt="Gem Kids Academy"
      style={{ width: "180px", marginBottom: "20px" }}
    />

    <form
      style={styles.loginBox}
      onSubmit={(e) => {
        if (loginMethod === "otp") {
          handleLogin(e);
        } else if (loginMethod === "id") {
          e.preventDefault();
          handleIdLogin();
        }
      }}
    >

      {settingsLoading ? (
  <p style={{ textAlign: "center", marginBottom: "20px" }}>
    Loading login options...
  </p>
) : (
  <>
    {allowOtpLogin && allowIdLogin && (
      <div style={styles.tabContainer}>
        <button
          type="button"
          onClick={() => setLoginMethod("otp")}
          style={{
            ...styles.tab,
            ...(loginMethod === "otp" ? styles.activeTab : {}),
          }}
        >
          OTP Login
        </button>

        <button
          type="button"
          disabled={isLoggingIn}
          onClick={() => setLoginMethod("id")}
          style={{
            ...styles.tab,
            ...(loginMethod === "id" ? styles.activeTab : {}),
          }}
        >
          ID Login
        </button>
      </div>
    )}
  </>
)}

      <h2>
        {!allowOtpLogin && !allowIdLogin
          ? "Login Unavailable"
          : loginMethod === "otp"
          ? "Login with OTP"
          : "Login with ID"}
      </h2>
        {!settingsLoading && !allowOtpLogin && !allowIdLogin && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              borderRadius: "6px",
              background: "#fff3cd",
              color: "#856404",
              border: "1px solid #ffeeba",
              textAlign: "center",
            }}
          >
            No login method is currently enabled. Please contact admin.
          </div>
        )}

      {loginMethod === "otp" && allowOtpLogin && (
        <>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            disabled={otpSent}
          />

          {!otpSent && (
            <button
              type="button"
              onClick={generateOtp}
              style={{ ...styles.button, ...styles.gButton }}
            >
              Generate OTP
            </button>
          )}

          {otpSent && timer === 0 && (
            <button
              type="button"
              onClick={generateOtp}
              style={{ ...styles.button, background: "#ffc107" }}
            >
              Resend OTP
            </button>
          )}

          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.input}
              />

              {timer > 0 && (
                <p style={{ textAlign: "center" }}>
                  Resend OTP in{" "}
                  {Math.floor(timer / 60)
                    .toString()
                    .padStart(2, "0")}
                  :
                  {(timer % 60)
                    .toString()
                    .padStart(2, "0")}
                </p>
              )}
            </>
          )}
        </>
      )}
{loginMethod === "id" && allowIdLogin && (
  <>
    <input
      type="text"
      placeholder="Student ID"
      value={studentId}
      onChange={(e) => setStudentId(e.target.value)}
      style={styles.input}
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={styles.input}
    />

    <button
      type="submit"
      disabled={isLoggingIn}
      style={{
        ...styles.button,
        ...styles.eButton,
        opacity: isLoggingIn ? 0.7 : 1,
        cursor: isLoggingIn ? "not-allowed" : "pointer",
      }}
    >
      {isLoggingIn ? "Logging in..." : "Login"}
    </button>
  </>
)}

      
      {loginMethod === "otp" && allowOtpLogin && otpSent && (
      <button
        type="submit"
        disabled={otp.trim().length !== 6 || isLoggingIn}
        style={{
          ...styles.button,
          ...styles.eButton,
          opacity:
            otp.trim().length === 6 && !isLoggingIn ? 1 : 0.5,
          cursor:
            otp.trim().length === 6 && !isLoggingIn
              ? "pointer"
              : "not-allowed",
        }}
      >
        {isLoggingIn ? "Logging in..." : "Login"}
      </button>
    )}
      


      <button
        type="button"
        onClick={() => navigate("/guest-chatbot")}
        style={{
          ...styles.button,
          ...styles.mButton,
          marginTop: "10px",
        }}
      >
        Continue As Guest
      </button>
    

      {error && <p style={styles.error}>{error}</p>}
    </form>
  </div>
);

}

// ----------------- Private Route -----------------
const PrivateRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

// ----------------- Main App -----------------
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [_sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    document.title = "Gem AI";
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginPage setIsLoggedIn={setIsLoggedIn} setDoctorData={setDoctorData} setSessionToken={setSessionToken} />}
        />

        {/* Admin Routes */}
        <Route
          path="/AdminPanel"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <AdminPanel doctorData={doctorData} />
            </PrivateRoute>
          }
        />
        <Route path="/pdf-viewer" element={<StudentPdfViewer />} />

        {/*
        <Route path="/add-doctor" element={<PrivateRoute isLoggedIn={isLoggedIn}><AddDoctor /></PrivateRoute>} />
        <Route path="/edit-doctor" element={<PrivateRoute isLoggedIn={isLoggedIn}><EditDoctor /></PrivateRoute>} />
        <Route path="/view-doctors" element={<PrivateRoute isLoggedIn={isLoggedIn}><ViewDoctors /></PrivateRoute>} />
        <Route path="/delete-doctor" element={<PrivateRoute isLoggedIn={isLoggedIn}><DeleteDoctor /></PrivateRoute>} />
        */}
        {/* Chatbot Routes */}
        <Route path="/ChatBot" element={<DemoChatbot doctorData={doctorData} />} />
        <Route path="/usage-dashboard" element={<PrivateRoute isLoggedIn={isLoggedIn}><UsageDashboard /></PrivateRoute>} />
        <Route path="/guest-chatbot" element={<GuestChatbot />} />
        <Route path="/chatbot-settings" element={<PrivateRoute isLoggedIn={isLoggedIn}><ChatbotSettings /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

// ----------------- Styles -----------------
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f0f2f5",
  },

  loginBox: {
    padding: "30px",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    minWidth: "300px",
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },

  button: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "4px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },

  // 🎨 CORRECT LOGO COLORS
  gButton: {
    backgroundColor: "rgb(219, 71, 45)",   // g (red-orange)
  },
  eButton: {
    backgroundColor: "rgb(0, 140, 200)",   // e (blue)
  },
  mButton: {
    backgroundColor: "rgb(242, 152, 52)",  // m (orange)
  },

  tabContainer: {
    display: "flex",
    marginBottom: "20px",
  },

  tab: {
    flex: 1,
    padding: "12px",
    cursor: "pointer",
    border: "1px solid #ddd",
    background: "#f5f5f5",
    fontWeight: "bold",
  },

  activeTab: {
    background: "rgb(0,140,200)",
    color: "#fff",
  },

  error: {
    color: "red",
    marginTop: "10px",
  },
};


export default App;
