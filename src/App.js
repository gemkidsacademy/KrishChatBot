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

// --- Login Page ---
function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [loginMode] = useState("otp"); // "password" or "otp"
  const [isDisabled, setIsDisabled] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const server = "https://krishbackend-production-9603.up.railway.app";

  // --- Generate OTP ---
  const generateOtp = async () => {
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    const formattedEmail = email.trim();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formattedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch(`${server}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formattedEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setError(null);
        setIsDisabled(false);
        console.log("[INFO] OTP sent successfully:", data);
      } else {
        setError(data.detail || "Failed to generate OTP");
        console.warn("[WARN] OTP generation failed:", data);
      }
    } catch (err) {
      setError("Failed to generate OTP");
      console.error("[ERROR] Exception while generating OTP:", err);
    }
  };

  // --- Handle OTP Login ---
  const handleLogin = async () => {
    if (!otpSent) {
      setError("Please generate OTP first");
      return;
    }

    if (!email) {
      setError("Please enter email");
      return;
    }

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    const formattedEmail = email.trim();
    console.log("[INFO] Sending verify-otp request for email:", formattedEmail);

    try {
      const verifyResponse = await fetch(`${server}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formattedEmail, otp }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok) {
        console.log("[INFO] OTP verified successfully");
        setIsLoggedIn(true);
        setDoctorData(verifyData); // ensure backend returns user info including class_name
        setSessionToken(null);

        if (verifyData?.name === "Admin") {
          navigate("/AdminPanel");
        } else {
          navigate("/ChatBot");
        }
      } else {
        setError(verifyData.detail || "Invalid OTP");
        console.warn("[WARN] OTP verification failed:", verifyData);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("[ERROR] OTP login failed unexpectedly:", err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>{loginMode === "password" ? "Login with ID/Password" : "Login with OTP"}</h2>

        {loginMode === "password" ? (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={otpSent} // disable email after OTP is sent
            />
            {!otpSent && (
              <button
                onClick={generateOtp}
                style={{ ...styles.button, background: "#28a745", marginTop: "5px" }}
                disabled={!email}
              >
                Generate OTP
              </button>
            )}
            {otpSent && (
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.input}
              />
            )}
          </>
        )}

        <button
          onClick={handleLogin}
          style={{
            ...styles.button,
            backgroundColor: "#EC5125",
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
          disabled={isDisabled}
        >
          Login
        </button>

        <button
          onClick={() => window.location.href = "/guest-chatbot"}
          style={{
            ...styles.button,
            backgroundColor: "#007bff",
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

// --- Private Route Wrapper ---
const PrivateRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/" />;
};

// --- Main App ---
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
          element={
            <LoginPage
              setIsLoggedIn={setIsLoggedIn}
              setDoctorData={setDoctorData}
              setSessionToken={setSessionToken}
            />
          }
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

// --- Styles ---
const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" },
  loginBox: { padding: "30px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center", minWidth: "300px" },
  input: { width: "100%", padding: "10px", margin: "10px 0", borderRadius: "4px", border: "1px solid #ccc", fontSize: "16px" },
  button: { width: "100%", padding: "10px", marginTop: "10px", borderRadius: "4px", border: "none", background: "#007bff", color: "#fff", cursor: "pointer", fontSize: "16px" },
  error: { color: "red", marginTop: "10px" },
  toggle: { marginTop: "10px", cursor: "pointer", color: "#007bff", textDecoration: "underline" },
};

export default App;
