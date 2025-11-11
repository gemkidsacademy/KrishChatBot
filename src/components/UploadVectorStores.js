import React, { useState } from "react";

const UploadVectorStores = () => {
  const [message, setMessage] = useState("");

  // Step 1: Process Vector Stores
  const handleProcessVectorStores = async () => {
    setMessage("Processing vector stores...");
    try {
      const response = await fetch(
        "https://krishbackend-production-9603.up.railway.app/admin/create_vectorstores",
        { method: "POST" }
      );
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "✅ Vector stores processed successfully!");
      } else {
        setMessage(data.message || "❌ Processing failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ An error occurred during vector store processing.");
    }
  };

  // Step 2: Upload Embeddings
  const handleUploadEmbeddings = async () => {
    setMessage("Uploading embeddings to Railway DB...");
    try {
      const response = await fetch(
        "https://krishbackend-production-9603.up.railway.app/admin/upload_embeddings_to_db",
        { method: "POST" }
      );
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "✅ Embeddings uploaded successfully!");
      } else {
        setMessage(data.message || "❌ Upload failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ An error occurred during embeddings upload.");
    }
  };

  // Step 3: Initialize Faiss Memory
  const handleInitializeFaiss = async () => {
    setMessage("Initializing Faiss memory...");
    try {
      const response = await fetch(
        "https://krishbackend-production-9603.up.railway.app/admin/initialize_faiss",
        { method: "POST" }
      );
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "✅ Faiss memory initialized successfully!");
      } else {
        setMessage(data.message || "❌ Initialization failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ An error occurred during Faiss memory initialization.");
    }
  };

  return (
    <div className="space-y-4 max-w-sm">
      <button
        onClick={handleProcessVectorStores}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
      >
        Process Vector Stores
      </button>

      <button
        onClick={handleUploadEmbeddings}
        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
      >
        Upload Embeddings
      </button>

      <button
        onClick={handleInitializeFaiss}
        className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
      >
        Initialize Faiss Memory
      </button>

      {message && (
        <p className="mt-2 text-sm text-gray-700 border-t pt-2">{message}</p>
      )}
    </div>
  );
};

export default UploadVectorStores;
