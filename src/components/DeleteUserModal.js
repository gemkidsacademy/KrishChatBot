import React, { useState, useEffect } from "react";
import "./AddUserForm.css"; // reuse modal styling

function DeleteUserModal({ onClose, onUserDeleted }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

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

  const handleDelete = async () => {
    if (!selectedUserId) {
      alert("Please select a user to delete");
      return;
    }

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

        <div className="modal-actions">
          <button onClick={handleDelete}>Delete</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;
