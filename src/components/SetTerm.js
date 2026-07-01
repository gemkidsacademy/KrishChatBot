import React, { useEffect, useState } from "react";

function SetTerm() {
  const [termName, setTermName] = useState("");
  
  const [loading, setLoading] = useState(false);

  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://krishbackend-production-9603.up.railway.app";

  useEffect(() => {
  const fetchCurrentTerm = async () => {
    try {
      const res = await fetch(`${API_BASE}/chatbot-current-term`);

      if (!res.ok) {
        throw new Error("Failed to fetch current term");
      }

      const data = await res.json();

      setTermName(data.term_name);
    } catch (err) {
      console.error(err);
      alert("Unable to load current term.");
    }
  };

  fetchCurrentTerm();
}, []);

  // -----------------------------
  // Save term
  // -----------------------------
  const handleSave = async () => {
    if (!termName) {
      alert("Please select a term.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/chatbot-current-term`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term_name: termName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Unable to update term");
      }

      alert("Current term updated successfully.");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        background: "#fff",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: "25px",
        }}
      >
        Set Current Term
      </h2>

      <div style={{ marginTop: "20px" }}>
        <label>
          Current Term Name:
        </label>

        <div
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "14px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            fontSize: "16px",
            color: "#333",
            boxSizing: "border-box",
          }}
        >
          {termName}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          marginTop: "25px",
          width: "100%",
          padding: "12px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Updating..." : "Update"}
      </button>
      <p
        style={{
          marginTop: "10px",
          marginBottom: "20px",
          padding: "12px",
          backgroundColor: "#fff8e1",
          border: "1px solid #f0c36d",
          borderRadius: "6px",
          color: "#8a6d3b",
          fontSize: "14px",
        }}
      >
        <strong>Note:</strong> The term name must exactly match the corresponding
        term folder name on Google Drive for each Class Year (including spaces,
        capitalization, and spelling).
      </p>
    </div>
  );
}

export default SetTerm;