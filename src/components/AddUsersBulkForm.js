import React, { useState } from "react";

function AddUsersBulkForm({ onClose, onUsersAdded }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
  // ✅ Prevent double submission
    if (loading) return;
  
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }
  
    try {
      setLoading(true);
      setError("");
  
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch(
        "https://krishbackend-production-9603.up.railway.app/api/users/bulk",
        {
          method: "POST",
          body: formData,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to add users.");
      }
  
      const result = await response.json();
  
      // ✅ Handle both old and new backend response formats
      const addedUsers = result.added_users || result.users || [];
      const skippedUsers = result.skipped_users || [];
      const summary = result.summary || {
        added: addedUsers.length,
        skipped: skippedUsers.length,
        total_rows: addedUsers.length + skippedUsers.length,
      };
  
      // ✅ Dynamic feedback to user
      let message = `${summary.added} user${summary.added !== 1 ? "s" : ""} added successfully.`;
      if (summary.skipped > 0) {
        message += ` ${summary.skipped} skipped (duplicates or invalid data).`;
      }
  
      alert(message);
  
      if (skippedUsers.length > 0) {
        console.table(skippedUsers); // Log skipped users for debugging
      }
  
      onUsersAdded(addedUsers);
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Something went wrong while uploading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Add Users in Bulk</h2>

      <input type="file" accept=".csv" onChange={handleFileChange} />
      {file && <p>Selected file: {file.name}</p>}

      {error && <p className="error">{error}</p>}

      <div className="modal-actions">
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        <button onClick={onClose} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AddUsersBulkForm;
