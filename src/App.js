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

// --- Login Page ---
function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const server = "https://krishbackend-production.up.railway.app";


  // --- Generate OTP ---
  const generateOtp = async () => {
    if (!phone) return setError("Please enter phone number");
    try {
      const response = await fetch(`${server}/generate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setError(null);
      } else {
        setError(data.error || "Failed to generate OTP");
      }
    } catch (err) {
      setError("Failed to generate OTP");
    }
  };

  // --- Login Handler ---
  const handleLogin = async () => {
  try {
    setIsLoggedIn(false);
    setDoctorData(null);

    // Prepare payload based on login mode
    let payload;
    if (loginMode === "password") {
      // Backend expects 'name' instead of 'username'
      payload = { name: username, password };
    } else {
      if (!otpSent) return setError("Please generate OTP first");
      payload = { phone, otp };
    }

    // Send login request to FastAPI backend
    const response = await fetch(`${server}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important for cookie handling
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful
      setIsLoggedIn(true);
      setDoctorData(data); // backend sends name, email, etc.
      setSessionToken(data.session_token || null);
      setError(null);

      // Navigate based on name
      if (data?.name === "Admin") {
        navigate("/AdminPanel"); // route for admin users
      } else {
        navigate("/ChatBot"); // route for other users
      }
    } else {
      setError(data.detail || "Invalid credentials");
    }
  } catch (err) {
    console.error(err);
    setError("Failed to login");
  }
};


  const toggleLoginMode = () => {
    setLoginMode(loginMode === "password" ? "otp" : "password");
    setError(null);
    setOtpSent(false);
    setOtp("");
    setUsername("");
    setPassword("");
    setPhone("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>
          {loginMode === "password" ? "Login with ID/Password" : "Login with OTP"}
        </h2>

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
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              disabled={otpSent} // disable phone after OTP is sent
            />
            {!otpSent && (
              <button
                onClick={generateOtp}
                style={{ ...styles.button, background: "#28a745", marginTop: "5px" }}
                disabled={!phone}
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

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>

        <p style={styles.toggle} onClick={toggleLoginMode}>
          {loginMode === "password"
            ? "Login with OTP instead"
            : "Login with ID/Password instead"}
        </p>

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
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    document.title = "Class Management System";
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
        <Route
          path="/AdminPanel"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-doctor"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <AddDoctor />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-doctor"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <EditDoctor />
            </PrivateRoute>
          }
        />
        <Route
          path="/view-doctors"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <ViewDoctors />
            </PrivateRoute>
          }
        />
        <Route
          path="/delete-doctor"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <DeleteDoctor />
            </PrivateRoute>
          }
        />

        {/* Sociology Chatbot */}
        <Route
          path="/ChatBot"
          element={<DemoChatbot doctorData={doctorData} />}
        />
      </Routes>
    </Router>
  );
}

// --- Styles ---
const styles = {
  container: {
    display: "flex",
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
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  toggle: {
    marginTop: "10px",
    cursor: "pointer",
    color: "#007bff",
    textDecoration: "underline",
  },
};

export default App;
