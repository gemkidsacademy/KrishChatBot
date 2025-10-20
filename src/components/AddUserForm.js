import React, { useState } from "react";
import "./AddUserForm.css";

function AddUserForm({ onClose, onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email address";

    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (!/^04\d{8}$/.test(phoneNumber))
      newErrors.phoneNumber = "Enter a valid Australian phone number (e.g. 0412345678)";

    if (!className.trim()) newErrors.className = "Class name is required";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
            name,
            email,
            phone_number: phoneNumber,
            class_name: className,
            password,
          }),
        }
      );

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
          />
          {errors.name && <div className="error">{errors.name}</div>}

          <input
            type="email"
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <div className="error">{errors.email}</div>}

          <input
            type="text"
            placeholder="Phone number (e.g. 0412345678)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          {errors.phoneNumber && <div className="error">{errors.phoneNumber}</div>}

          <input
            type="text"
            placeholder="Class name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          {errors.className && <div className="error">{errors.className}</div>}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <div className="error">{errors.password}</div>}

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
