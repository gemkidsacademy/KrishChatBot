// StudentDashboard.js
import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import axios from "axios";

const StudentDashboard = ({ doctorData }) => {
  const [activeLink, setActiveLink] = useState("ai_evaluator");
  const [accessAllowed, setAccessAllowed] = useState(null); // null = loading

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await axios.get(
          `https://usefulapis-production.up.railway.app/check-user-access?username=${doctorData.name}`
        );
        setAccessAllowed(response.data.access_allowed);
      } catch (error) {
        console.error("Failed to check access:", error);
        setAccessAllowed(false);
      }
    };

    checkAccess();
  }, [doctorData.name]);

  if (accessAllowed === null) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Loading dashboard...</div>;
  }

  if (!accessAllowed) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontSize: "18px", color: "#b91c1c" }}>
        ❌ Access Restricted: You have exceeded your allowed usage limit.
      </div>
    );
  }

  const colors = {
    primary: "#2563eb",
    primaryLight: "#dbeafe",
    accent: "#0ea5e9",
    background: "#f9fafb",
    surface: "#ffffff",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
  };

  const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    background: "linear-gradient(to bottom right, #e0c3fc, #8ec5fc)", // gradient like chat UI
    color: colors.textPrimary,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "1rem",
    boxSizing: "border-box",
  },

  header: {
    padding: "16px 24px",
    background: "linear-gradient(to right, #4f46e5, #9333ea)", // modern gradient header
    color: "#fff",
    fontSize: "1.1rem",
    fontWeight: "600",
    letterSpacing: "0.5px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "1100px",
    borderRadius: "16px",
    marginBottom: "15px",
  },

  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  navBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    backgroundColor: "#ffffff", // card-like nav background
    padding: "10px 16px",
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontSize: "14px",
    justifyContent: "center",
    width: "100%",
    maxWidth: "1100px",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  navLink: (isActive) => ({
    textDecoration: "none",
    color: isActive ? "#4f46e5" : colors.textSecondary,
    fontWeight: isActive ? "600" : "500",
    padding: "10px 16px",
    borderRadius: "12px",
    background: isActive ? "linear-gradient(to right, #dbeafe, #c7d2fe)" : "transparent",
    boxShadow: isActive ? "inset 0 0 5px rgba(0,0,0,0.1)" : "none",
    transition: "all 0.25s ease",
    cursor: "pointer",
  }),

  mainContent: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ffffff", // card-like content
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
    overflowY: "auto",
    margin: "0 auto 20px",
    maxWidth: "1100px",
    boxSizing: "border-box",
  },

  footer: {
    textAlign: "center",
    padding: "12px 0",
    fontSize: "13px",
    color: colors.textSecondary,
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "1100px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
};

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <span role="img" aria-label="ai">🤖</span>
          <span>AI Tutor — Helping You Prepare for Exams!</span>
        </div>
        {/* Placeholder for future logout/profile */}
        <div style={{ fontSize: "13px", opacity: 0.9 }}>Welcome, {doctorData.name}</div>
      </header>

      {/* NavBar */}
      <nav style={styles.navBar}>
        {[
          ["ai_evaluator", "📝 AI Evaluator"],
          ["ai_learning", "📘 AI Interactive Learning"],
          ["StudentReport", "📊 Exams Preparation Status"],
          ["AiAudioLearning", "🎧 Talk to the AI"],
          ["StudentUsageReport", "📈 App Usage"],
          ["ResponseAnalyzer", "🔍 Response Analyzer"],
        ].map(([key, label]) => (
          <Link
            key={key}
            to={`/StudentDashboard/${key}`}
            style={styles.navLink(activeLink === key)}
            onClick={() => setActiveLink(key)}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} AI Tutor | Empowering Smarter Learning
      </footer>
    </div>
  );
};

export default StudentDashboard;
