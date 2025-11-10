import React, { useState } from "react";

const UploadVectorStores = () => {
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    setMessage("Processing...");

    try {
      const response = await fetch(
        "https://krishbackend-production-9603.up.railway.app/admin/create_vectorstores",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Vector stores processed successfully!");
      } else {
        setMessage(data.message || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during processing.");
    }
  };

  return (
    <div>
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Process Vector Stores
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default UploadVectorStores;
