import React, { useState } from "react";

function AddUsersBulkForm({ onClose, onUsersAdded }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Excel file.");
      return;
    }

    try {
      setLoading(true);

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);

      // Backend call
      const response = await fetch("https://your-backend.com/api/users/bulk", {
        method: "POST",
        body: formData, // Send file directly
      });

      if (!response.ok) {
        throw new Error("Failed to add users. Please try again.");
      }

      const result = await response.json();
      onUsersAdded(result.users || []); // Backend returns added users
      alert(`${result.users.length} users added successfully!`);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Add Users in Bulk</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      {error && <p className="error">{error}</p>}

      <div className="modal-actions">
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        <button onClick={onClose} disabled={loading}>Cancel</button>
      </div>
    </div>
  );
}

export default AddUsersBulkForm;
