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

      // ✅ Show dynamic feedback
      const addedCount = result.users?.length || 0;
      if (addedCount > 0) {
        alert(`${addedCount} user${addedCount > 1 ? "s" : ""} added successfully!`);
      } else {
        alert("No new users were added (all may already exist).");
      }

      onUsersAdded(result.users || []);
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
