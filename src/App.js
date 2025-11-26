import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0); // seconds for OTP resend
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);

  const navigate = useNavigate();
  const server = "https://krishbackend-production-9603.up.railway.app";

  // ------------------ OTP Timer ------------------
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // ------------------ Enable Login Button ------------------
  useEffect(() => {
    if (otpSent && otp.trim() !== "") {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [otpSent, otp]);

  // ------------------ Generate OTP ------------------
  const generateOtp = async () => {
    setError(null);
    if (!email) return setError("Please enter your email");

    const formattedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formattedEmail)) return setError("Please enter a valid email");

    try {
      const response = await fetch(`${server}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formattedEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setTimer(300); // 5 min
        setError(null);
        console.log("[INFO] OTP sent:", data);
      } else {
        setError(data.detail || "Failed to generate OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate OTP. Check your network.");
    }
  };

  // ------------------ Handle OTP Login ------------------
  const handleLogin = async () => {
    if (!otpSent) return setError("Please generate OTP first");
    if (!otp.trim()) return setError("Please enter OTP");

    const formattedEmail = email.trim();
    try {
      const response = await fetch(`${server}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formattedEmail, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setDoctorData(data.user);
        setSessionToken(null);
        if (data.user.name === "Admin") navigate("/AdminPanel");
        else navigate("/ChatBot");
      } else {
        setError(data.detail || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  // ------------------ Format Timer ------------------
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>Login with OTP</h2>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          disabled={otpSent}
        />

        {/* Generate or Resend OTP */}
        {!otpSent && (
          <button
            onClick={generateOtp}
            style={{ ...styles.button, background: "#28a745", marginTop: "5px" }}
            disabled={!email.trim()}
          >
            Generate OTP
          </button>
        )}
        {otpSent && timer === 0 && (
          <button
            onClick={generateOtp}
            style={{ ...styles.button, background: "#ffc107", marginTop: "5px" }}
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
            onChange={(e) => setOtp(e.target.value)}
            style={styles.input}
          />
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            ...styles.button,
            backgroundColor: "#EC5125",
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? "not-allowed" : "pointer",
            marginTop: "10px",
          }}
          disabled={isDisabled}
        >
          Login
        </button>

        {/* Countdown Timer */}
        {otpSent && timer > 0 && (
          <p style={{ marginTop: "10px", textAlign: "center" }}>
            Resend OTP available in {formatTime(timer)}
          </p>
        )}

        {/* Error Message */}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" },
  loginBox: { padding: "30px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center", minWidth: "300px" },
  input: { width: "100%", padding: "10px", margin: "10px 0", borderRadius: "4px", border: "1px solid #ccc", fontSize: "16px" },
  button: { width: "100%", padding: "10px", marginTop: "10px", borderRadius: "4px", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px" },
  error: { color: "red", marginTop: "10px" },
};

export default LoginPage;
