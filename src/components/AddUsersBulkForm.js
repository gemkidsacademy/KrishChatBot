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
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://krishbackend-production-9603.up.railway.app/api/users/bulk", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add users.");
      }

      const result = await response.json();
      onUsersAdded(result.users || []);
      alert(`${result.users.length} users added successfully!`);
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Add Users in Bulk</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
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
