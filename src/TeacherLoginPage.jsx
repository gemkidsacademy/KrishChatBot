import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function TeacherLoginPage({
  setIsLoggedIn,
  setDoctorData,
  setSessionToken,
}) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  const server =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://krishbackend-production-9603.up.railway.app";

  const handleTeacherLogin = async (e) => {
    e.preventDefault();

    if (isLoggingIn) return;

    if (!studentId.trim()) {
      setError("Enter Teacher ID");
      return;
    }

    if (!password.trim()) {
      setError("Enter Password");
      return;
    }

    setError("");
    setIsLoggingIn(true);

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

  return (
    <div style={styles.container}>
      <img
        src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
        alt="Gem Kids Academy"
        style={{ width: "180px", marginBottom: "20px" }}
      />

      <form style={styles.loginBox} onSubmit={handleTeacherLogin}>
        <h2>Teacher Login</h2>

        <input
          type="text"
          placeholder="Teacher ID"
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

        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

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
    minWidth: "320px",
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

  eButton: {
    backgroundColor: "rgb(0,140,200)",
  },

  error: {
    color: "red",
    marginTop: "10px",
  },
};

export default TeacherLoginPage;