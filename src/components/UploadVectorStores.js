import React, { useState } from "react";

const UploadVectorStores = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://krishbackend-production-9603.up.railway.app/admin/create_vectorstores",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setMessage("File uploaded successfully!");
      } else {
        setMessage("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during upload.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Upload
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default UploadVectorStores;
