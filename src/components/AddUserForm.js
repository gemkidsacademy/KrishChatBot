import React, { useState } from "react";
import "./AddUserForm.css";

function AddUserForm({ onClose, onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");

  const validate = () => {
    // Check all fields
    if (!name || !email || !phoneNumber || !className || !password) {
      alert("All fields are required");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }

    // Phone number validation: must start with 04 and have 10 digits
    const phoneRegex = /^04\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      alert("Please enter a valid Australian phone number (e.g. 0412345678)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch(
        "https://krishbackend-production.up.railway.app/api/add-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone_number: phoneNumber.trim(),
            class_name: className.trim(),
            password: password.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add user");
      await response.json();
      alert("User added successfully");
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
            placeholder="Phone number (e.g. 0412345678)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Class name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
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
