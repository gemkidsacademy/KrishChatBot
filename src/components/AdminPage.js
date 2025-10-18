import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";
import PdfUploader from "./PdfUploader";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("database");
  const navigate = useNavigate(); // For navigation

  const tabs = [
    { id: "database", label: "Chatbot User Management" },
    { id: "AI_tutor", label: "Add PDF for AI Tutor" },
    { id: "openai", label: "View OpenAI Usage" },
    { id: "Generic_chatbot", label: "Generic Chatbot Settings" },
  ];

  // Navigate to Usage Dashboard
  const handleViewUsage = () => {
    navigate("/usage-dashboard");
  };
  const handleChatbotSetting = () => {
    navigate("/chatbot-settings");
  };


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* -------------------- Tab Navigation -------------------- */}
      <div className="tab-nav">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* -------------------- Tab Content -------------------- */}
      <div className="tab-content">
        {/* Database (User Management) */}
        {activeTab === "database" && (
          <div className="tab-panel">
            <button className="dashboard-button">Add User</button>
            <button className="dashboard-button">Edit User</button>
            <button className="dashboard-button">View User</button>
            <button className="dashboard-button">Delete User</button>
          </div>
        )}

        {/* AI Tutor (PDF Upload) */}
        {activeTab === "AI_tutor" && (
          <div className="tab-panel">
            <PdfUploader />
          </div>
        )}
        {/* Generic Chatbot) */}
        {activeTab === "Generic_chatbot" && (
          <div className="tab-panel">
            <ChatbotSettings />
          </div>
        )}
        

        {/* OpenAI Usage */}
        {activeTab === "openai" && (
          <div className="tab-panel">
            <h3>OpenAI API Usage</h3>
            <p>Click below to view detailed usage statistics.</p>
            <button className="dashboard-button" onClick={handleViewUsage}>
              View OpenAI Usage
            </button>
          </div>
        )}

        
        
      </div>
    </div>
  );
};

export default AdminPanel;
