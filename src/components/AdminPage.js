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

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("database");
  const navigate = useNavigate();

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [showAddUsersBulk, setShowAddUsersBulk] = useState(false);

  const tabs = [
    { id: "database", label: "Chatbot User Management" },
    { id: "AI_tutor", label: "Add PDF for AI Tutor" },
    { id: "openai", label: "View OpenAI Usage" },
    { id: "Generic_chatbot", label: "Generic Chatbot Settings" },
    { id: "upload_vector_stores", label: "Upload Vector Stores" },
  ];

  // --- Reset Students backend call ---
  const handleResetStudents = async () => {
    try {
      const response = await fetch("https://your-backend-url/reset-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to reset students");

      alert("All students have been reset successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong while resetting students.");
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
        {/* --- DATABASE TAB --- */}
        {activeTab === "database" && (
          <div className="tab-panel">
            <div>
              <button className="dashboard-button" onClick={() => setShowAddUsersBulk(true)}>
                Add Users in Bulk
              </button>
              {showAddUsersBulk && (
                <AddUsersBulkForm onClose={() => setShowAddUsersBulk(false)} onUsersAdded={handleUsersAdded} />
              )}
            </div>

            <div>
              <button className="dashboard-button" onClick={() => setShowAddUser(true)}>
                Add User
              </button>
              {showAddUser && (
                <AddUserForm onClose={() => setShowAddUser(false)} onUserAdded={handleUserAdded} />
              )}
            </div>

            <div>
              <button className="dashboard-button" onClick={() => setShowEditUser(true)}>
                Edit User
              </button>
              {showEditUser && (
                <EditUserForm onClose={() => setShowEditUser(false)} onUserUpdated={handleUserUpdated} />
              )}
            </div>

            <div>
              <button className="dashboard-button" onClick={() => setShowViewUser(true)}>
                View User
              </button>
              {showViewUser && <ViewUserModal onClose={() => setShowViewUser(false)} />}
            </div>

            <div>
              <button className="dashboard-button" onClick={() => setShowDeleteUser(true)}>
                Delete User
              </button>
              {showDeleteUser && (
                <DeleteUserForm onClose={() => setShowDeleteUser(false)} onUserDeleted={handleUserDeleted} />
              )}
            </div>

            {/* ---- NEW RESET STUDENTS BUTTON ---- */}
            <div>
              <button className="dashboard-button" onClick={handleResetStudents}>
                Reset Students
              </button>
            </div>
          </div>
        )}

        {/* --- AI TUTOR PDF UPLOAD --- */}
        {activeTab === "AI_tutor" && (
          <div className="tab-panel">
            <PdfUploader />
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
