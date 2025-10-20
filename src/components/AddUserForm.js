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

  // ----------------- Trim all fields -----------------
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = phoneNumber.trim();
  const trimmedClass = className.trim();
  const trimmedPassword = password.trim();

  // ----------------- Validation -----------------
  if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedClass || !trimmedPassword) {
    alert("All fields are required");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    alert("Please enter a valid email address");
    return;
  }

  // Validate phone number format: exactly 10 digits starting with 04
  const phoneRegex = /^04\d{8}$/;
  if (!phoneRegex.test(trimmedPhone)) {
    alert("Please enter a valid Australian phone number (e.g. 0412345678)");
    return;
  }

  // ----------------- Submit to backend -----------------
  try {
    const response = await fetch(
      "https://krishbackend-production.up.railway.app/api/add-user",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone_number: trimmedPhone,
          class_name: trimmedClass,
          password: trimmedPassword,
        }),
      }
    );

    const responseData = await response.json();
    console.log("[DEBUG] Add user response:", responseData);

    if (!response.ok) {
      alert(`Error adding user: ${JSON.stringify(responseData, null, 2)}`);
      return;
    }

    alert("User added successfully");
    onUserAdded();
  } catch (err) {
    console.error("[ERROR] Failed to add user:", err);
    alert("An unexpected error occurred while adding the user");
  }
};


  try {
    const response = await fetch(
      "https://krishbackend-production.up.railway.app/api/add-user",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone_number: trimmedPhone,
          class_name: trimmedClass,
          password: trimmedPassword,
        }),
      }
    );

    // Debug: log raw response
    const responseData = await response.json();
    console.log("[DEBUG] Add user response:", responseData);

    if (!response.ok) {
      alert(responseData.detail || "Failed to add user");
      return;
    }

    // Successfully added user
    onUserAdded();
  } catch (err) {
    console.error("[ERROR] Add user failed:", err);
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
