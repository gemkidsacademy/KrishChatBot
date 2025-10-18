import React, { useState } from "react";
import "./AddUserForm.css";

function AddUserForm({ onClose, onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!name || !email || !password) {
      alert("Name, email, and password are required");
      return;
    }

    try {
      const response = await fetch("https://your-backend-url.com/api/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone_number: phoneNumber,
          class_name: className,
          password, // backend should hash it
        }),
      });

      if (!response.ok) throw new Error("Failed to add user");
      await response.json();
      onUserAdded();
    } catch (err) {
      console.error(err);
      alert("Error adding user");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add New User</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone number (optional)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="Class name (optional)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="modal-actions">
            <button type="submit">Add User</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserForm;
