import React, { useState, useEffect } from "react";
import "./AddUserForm.css";

function DeleteUserModal({ onClose, onUserDeleted }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");

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

  useEffect(() => {
    const user = users.find((u) => u.id === parseInt(selectedUserId));
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phone_number || "");
      setClassName(user.class_name || "");
    } else {
      setName("");
      setEmail("");
      setPhoneNumber("");
      setClassName("");
    }
  }, [selectedUserId, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return alert("Please select a user to delete");
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(
        `https://your-backend-url.com/api/delete-user/${selectedUserId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete user");
      await res.json();
      onUserDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Delete User</h3>

        <form onSubmit={handleSubmit}>
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

          {selectedUserId && (
            <div className="user-details">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Phone:</strong> {phoneNumber}</p>
              <p><strong>Class:</strong> {className}</p>
            </div>
          )}

          <div className="modal-actions">
            <button type="submit" disabled={!selectedUserId}>Delete</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteUserModal;
