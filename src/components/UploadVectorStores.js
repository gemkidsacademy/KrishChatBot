import React, { useState } from "react";

const UploadVectorStores = () => {
  const [message, setMessage] = useState("");

  // Handler for processing vector stores (existing functionality)
  const handleProcessVectorStores = async () => {
    setMessage("Processing vector stores...");

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
        setMessage(data.message || "Processing failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during vector store processing.");
    }
  };

  // Handler for uploading embeddings to Railway DB (new functionality)
  const handleUploadEmbeddings = async () => {
    setMessage("Uploading embeddings to Railway DB...");

    try {
      const response = await fetch(
        "https://krishbackend-production-9603.up.railway.app/admin/upload_embeddings_to_db",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Embeddings uploaded to DB successfully!");
      } else {
        setMessage(data.message || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during embeddings upload.");
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleProcessVectorStores}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Process Vector Stores
      </button>

      <button
        onClick={handleUploadEmbeddings}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Upload Embeddings to Railway DB
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default UploadVectorStores;
