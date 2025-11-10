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
  const navigate = useNavigate(); // For navigation
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [showAddUsers, setShowAddUsers] = useState(false);
  const [showAddUsersBulk, setShowAddUsersBulk] = useState(false);

  
  
  const tabs = [
  { id: "database", label: "Chatbot User Management" },
  { id: "AI_tutor", label: "Add PDF for AI Tutor" },
  { id: "openai", label: "View OpenAI Usage" },
  { id: "Generic_chatbot", label: "Generic Chatbot Settings" },
  { id: "upload_vector_stores", label: "Upload Vector Stores" },
];

  const handleUserUpdated = () => {
    setShowEditUser(false);
    alert("User updated successfully!");
    // optionally refresh the user list
  };
  const handleUsersAdded = (users) => {
    setShowAddUsersBulk(false);
    alert(`${users.length} users added successfully!`);
    // optionally refresh the user list or update state
  };
  const handleUserAdded = () => {
    setShowAddUser(false); // close the modal
    alert("User added successfully!");
    // Optionally refresh your user list here
  };
  // Navigate to Usage Dashboard
  const handleViewUsage = () => {
    navigate("/usage-dashboard");
  };
  const handleDeleteUser = () => {
    navigate("/delete-user");
  };
  const handleUserDeleted = () => {
    // Optional: refetch users, show notification, or just log
    console.log("User deleted successfully");
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
            <div>
              <button className="dashboard-button" onClick={() => setShowAddUsersBulk(true)}>
                Add Users in Bulk
              </button>
            
              {showAddUsersBulk && (
                <AddUsersBulkForm
                  onClose={() => setShowAddUsersBulk(false)}
                  onUsersAdded={handleUsersAdded}
                />
              )}
            </div>

            <div>
              <button className="dashboard-button" onClick={() => setShowAddUser(true)}>
                Add User
              </button>
        
              {showAddUser && (
                <AddUserForm
                  onClose={() => setShowAddUser(false)}
                  onUserAdded={handleUserAdded}
                />
              )}
            </div>
            <div>
              <button className="dashboard-button" onClick={() => setShowEditUser(true)}>
                Edit User
              </button>
            
              {showEditUser && (
                <EditUserForm
                  onClose={() => setShowEditUser(false)}
                  onUserUpdated={handleUserUpdated}
                />
              )}
            </div>
            <div>
              <button className="dashboard-button" onClick={() => setShowViewUser(true)}>
                View User
              </button>
            
              {showViewUser && (
                <ViewUserModal
                  onClose={() => setShowViewUser(false)}
                />
              )}
            </div>

            <div>
              <button className="dashboard-button" onClick={() => setShowDeleteUser(true)}>
                Delete User
              </button>
            
              {showDeleteUser && (
                <DeleteUserForm
                  onClose={() => setShowDeleteUser(false)}
                  onUserDeleted={handleUserDeleted}
                />
              )}
            </div>

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
          <div
            className="tab-panel"
            style={{
              height: "100vh", // or a specific height
              overflowY: "auto",
            }}
          >
            <ChatbotSettings />
          </div>
        )}
        {/* upload vector store) */}
        {activeTab === "upload_vector_stores" && (
          <div
            className="tab-panel"
            style={{
              height: "100vh", // full height
              overflowY: "auto",
              padding: "1rem",
            }}
          >
            <h2 className="text-xl font-semibold mb-4">Upload Vector Stores</h2>
            <UploadVectorStores />
          </div>
        )}


        {/* OpenAI Usage */}
        {activeTab === "openai" && (
          <div
            className="tab-panel"
            style={{
              height: "100vh", // or a specific height
              overflowY: "auto",
            }}
          >
            <UsageDashboard />
          </div>
        )}

        
        
      </div>
    </div>
  );
};

export default AdminPanel;
