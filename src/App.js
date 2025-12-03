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
import AddDoctor from "./components/AddDoctorPage";
import EditDoctor from "./components/EditDoctorPage";
import ViewDoctors from "./components/ViewDoctors";
import DeleteDoctor from "./components/DeleteDoctor";
import DemoChatbot from "./components/DemoChatbot";
import UsageDashboard from "./components/UsageDashboard";
import ChatbotSettings from "./components/ChatbotSettings";
import GuestChatbot from "./components/GuestChatbot";

// ----------------- Login Page -----------------
function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0); // seconds left
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);

  const navigate = useNavigate();
  const server = "https://krishbackend-production-9603.up.railway.app";

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
        setIsDisabled(false);
        setTimer(300); // 5 minutes countdown
      } else {
        setError(data.detail || "Failed to generate OTP");
      }
    } catch (err) {
      setError("Server error while generating OTP");
    }
  };

  // ---------- Handle OTP Login ----------
  const handleLogin = async () => {
    if (!otpSent) return setError("Generate OTP first");
    if (!otp.trim()) return setError("Enter OTP");

    try {
      const res = await fetch(`${server}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.user?.name) {
        setDoctorData(data.user);
        setIsLoggedIn(true);
        setSessionToken(null);

        if (data.user.name === "Admin") navigate("/AdminPanel");
        else navigate("/ChatBot");
      } else {
        setError(data.detail || "Invalid OTP or missing user data");
      }
    } catch (err) {
      setError("Login failed. Try again.");
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

    <div style={styles.loginBox}>
      <h2>Login with OTP</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
        disabled={otpSent}
      />

      {!otpSent && (
        <button onClick={generateOtp} style={{ ...styles.button, ...styles.gButton }}>
          Generate OTP
        </button>
      )}

      {otpSent && timer === 0 && (
        <button onClick={generateOtp} style={{ ...styles.button, background: "#ffc107" }}>
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
              Resend OTP in {Math.floor(timer / 60).toString().padStart(2, "0")}:
              {(timer % 60).toString().padStart(2, "0")}
            </p>
          )}
        </>
      )}

      <button
        onClick={handleLogin}
        style={{
          ...styles.button,
          ...styles.eButton,
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? "not-allowed" : "pointer",
        }}

        disabled={isDisabled}
      >
        Login
      </button>

      <button
        onClick={() => navigate("/guest-chatbot")}
        style={{
          ...styles.button,
          ...styles.mButton,
          marginTop: "10px",
        }}

      >
        Continue as Guest
      </button>

      {error && <p style={styles.error}>{error}</p>}
    </div>
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
        <Route path="/AdminPanel" element={<PrivateRoute isLoggedIn={isLoggedIn}><AdminPanel /></PrivateRoute>} />
        <Route path="/add-doctor" element={<PrivateRoute isLoggedIn={isLoggedIn}><AddDoctor /></PrivateRoute>} />
        <Route path="/edit-doctor" element={<PrivateRoute isLoggedIn={isLoggedIn}><EditDoctor /></PrivateRoute>} />
        <Route path="/view-doctors" element={<PrivateRoute isLoggedIn={isLoggedIn}><ViewDoctors /></PrivateRoute>} />
        <Route path="/delete-doctor" element={<PrivateRoute isLoggedIn={isLoggedIn}><DeleteDoctor /></PrivateRoute>} />

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
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" },
  loginBox: { padding: "30px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center", minWidth: "300px" },
  input: { width: "100%", padding: "10px", margin: "10px 0", borderRadius: "4px", border: "1px solid #ccc", fontSize: "16px" },
  button: { width: "100%", padding: "10px", marginTop: "10px", borderRadius: "4px", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px" },
  error: { color: "red", marginTop: "10px" },
};

export default App;
