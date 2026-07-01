import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

import PdfUploader from "./PdfUploader";
import ChatbotSettings from "./ChatbotSettings";
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";
import ViewUserModal from "./ViewUserModal";
import DeleteUserForm from "./DeleteUserForm";
import UsageDashboard from "./UsageDashboard";
import AddUsersBulkForm from "./AddUsersBulkForm";
import UploadVectorStores from "./UploadVectorStores";
import SetTerm from "./SetTerm";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("set_term");
  const navigate = useNavigate();
  const server =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://krishbackend-production-9603.up.railway.app";

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [showAddUsersBulk, setShowAddUsersBulk] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const tabs = [
    { id: "set_term", label: "Set Term" },
    
    { id: "upload_vector_stores", label: "Upload Vector Stores" },
    { id: "openai", label: "View OpenAI Usage (not functional)" },
    { id: "Generic_chatbot", label: "Generic Chatbot Settings" },
    
  ];

  // --- Reset Students backend call ---
  const handleResetStudents = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all students?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setIsResetting(true);

      const response = await fetch(
        `${server}/reset-students`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to reset students");

      alert("All students have been reset successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong while resetting students.");
    } finally {
      setIsResetting(false);
    }
  };

  // Modal callbacks
  const handleUserAdded = () => {
    setShowAddUser(false);
    alert("User added successfully!");
  };

  const handleUsersAdded = (users) => {
    setShowAddUsersBulk(false);
    alert(`${users.length} users added successfully!`);
  };

  const handleUserUpdated = () => {
    setShowEditUser(false);
    alert("User updated successfully!");
  };

  const handleUserDeleted = () => {
    console.log("User deleted successfully");
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* -------------------- Tabs -------------------- */}
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

      {/* -------------------- Tab Content Wrapper (fixed) -------------------- */}
      <div className="tab-content">
        

        {/* --- SET TERM --- */}
        {activeTab === "set_term" && (
        <div className="set-term-panel">
          <SetTerm />
        </div>
      )}

        {/* --- GENERIC CHATBOT SETTINGS --- */}
        {activeTab === "Generic_chatbot" && (
          <div className="tab-panel" style={{ height: "100vh", overflowY: "auto" }}>
            <ChatbotSettings />
          </div>
        )}

        {/* --- UPLOAD VECTOR STORES --- */}
        {activeTab === "upload_vector_stores" && (
          <div className="tab-panel" style={{ height: "100vh", overflowY: "auto", padding: "1rem" }}>
            <h2 className="text-xl font-semibold mb-4">Upload Vector Stores</h2>
            <UploadVectorStores />
          </div>
        )}

        {/* --- OPENAI USAGE DASHBOARD --- */}
        {activeTab === "openai" && (
          <div className="tab-panel" style={{ height: "100vh", overflowY: "auto" }}>
            <UsageDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
