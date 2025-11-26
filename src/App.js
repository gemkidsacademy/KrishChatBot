import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);

  const navigate = useNavigate();
  const server = "https://krishbackend-production-9603.up.railway.app";

  // --- OTP Countdown Timer ---
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // --- Generate OTP ---
  const generateOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email");
      return;
    }

    try {
      const res = await fetch(`${server}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setError(null);
        setIsDisabled(false);
        setTimer(300); // 5 minutes countdown
      } else {
        setError(data.detail || "Failed to send OTP");
      }
    } catch (err) {
      setError("Server error. Try again.");
      console.error(err);
    }
  };

  // --- Verify OTP and Login ---
  const handleLogin = async () => {
    if (!otpSent) return setError("Please generate OTP first");
    if (!otp.trim()) return setError("Please enter OTP");

    try {
      const res = await fetch(`${server}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setIsLoggedIn(true);
        setDoctorData(data.user);
        setSessionToken(null);

        if (data.user.name === "Admin") navigate("/AdminPanel");
        else navigate("/ChatBot");
      } else {
        setError(data.detail || "Invalid OTP");
      }
    } catch (err) {
      setError("Login failed. Try again.");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>Login with OTP</h2>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
          disabled={otpSent}
        />

        {/* Generate / Resend OTP */}
        {!otpSent && (
          <button
            style={{ ...styles.button, background: "#28a745" }}
            onClick={generateOtp}
            disabled={!email.trim()}
          >
            Generate OTP
          </button>
        )}
        {otpSent && timer === 0 && (
          <button
            style={{ ...styles.button, background: "#ffc107" }}
            onClick={generateOtp}
          >
            Resend OTP
          </button>
        )}

        {/* OTP Input */}
        {otpSent && (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            style={styles.input}
          />
        )}

        {/* Login Button */}
        <button
          style={{
            ...styles.button,
            backgroundColor: "#EC5125",
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? "not-allowed" : "pointer",
            marginTop: "10px",
          }}
          onClick={handleLogin}
          disabled={isDisabled}
        >
          Login
        </button>

        {/* Countdown */}
        {otpSent && timer > 0 && (
          <p>
            Resend OTP in {Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")}:
            {(timer % 60).toString().padStart(2, "0")}
          </p>
        )}

        {/* Guest Login */}
        <button
          style={{ ...styles.button, backgroundColor: "#007bff", marginTop: "10px" }}
          onClick={() => navigate("/guest-chatbot")}
        >
          Continue as Guest
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

// --- Styles ---
const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" },
  loginBox: { padding: "30px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center", minWidth: "300px" },
  input: { width: "100%", padding: "10px", margin: "10px 0", borderRadius: "4px", border: "1px solid #ccc", fontSize: "16px" },
  button: { width: "100%", padding: "10px", marginTop: "10px", borderRadius: "4px", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px" },
  error: { color: "red", marginTop: "10px" },
};

export default LoginPage;
