import React, { useState } from "react";
import "./AdminPanel.css";
import PdfUploader from "./PdfUploader"; // <-- import your PdfUploader component

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("doctors");

  const tabs = [
    { id: "doctors", label: "Chatbot User Management" },
    { id: "chatbot", label: "Add PDF for AI tutor" },
    { id: "users", label: "View OpenAI Usage" },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* Tab Navigation */}
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

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "doctors" && (
          <div className="tab-panel">
            <button className="dashboard-button">Add User</button>
            <button className="dashboard-button">Edit User</button>
            <button className="dashboard-button">View User</button>
            <button className="dashboard-button">Delete User</button>
          </div>
        )}

        {activeTab === "chatbot" && (
          <div className="tab-panel">
            <PdfUploader /> {/* <-- Render PdfUploader here */}
          </div>
        )}

        {activeTab === "users" && (
          <div className="tab-panel">
            <button className="dashboard-button">View Users</button>
            <button className="dashboard-button">Manage Roles</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
