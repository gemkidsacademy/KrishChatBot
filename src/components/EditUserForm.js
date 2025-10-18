import React, { useState, useEffect } from "react";
import "./AddUserForm.css"; // reuse the same modal styling

function EditUserForm({ onClose, onUserUpdated }) {
  const [users, setUsers] = useState([]); // list of users to select
  const [selectedUserId, setSelectedUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");

  // Fetch existing users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://your-backend-url.com/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        alert("Error fetching users");
      }
    };

    fetchUsers();
  }, []);

  // Update form fields when a user is selected
  useEffect(() => {
    const user = users.find((u) => u.id === parseInt(selectedUserId));
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phone_number || "");
      setClassName(user.class_name || "");
      setPassword(""); // leave password empty; admin can reset
    }
  }, [selectedUserId, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert("Please select a user to edit");
      return;
    }

    try {
      const res = await fetch(
        `https://your-backend-url.com/api/edit-user/${selectedUserId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone_number: phoneNumber,
            class_name: className,
            password, // send only if admin wants to update
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update user");
      await res.json();
      onUserUpdated();
    } catch (err) {
      console.error(err);
      alert("Error updating user");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit User</h3>

        <form onSubmit={handleSubmit}>
          {/* User selection dropdown */}
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

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
            placeholder="Password (leave blank to keep unchanged)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="modal-actions">
            <button type="submit">Update User</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserForm;
