import React, { useState, useEffect } from "react";
import "./AddUserForm.css"; // reuse modal styling

function DeleteUserModal({ onClose, onUserDeleted }) {
  const [userIds, setUserIds] = useState([]); // list of user IDs
  const [selectedUserId, setSelectedUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");

  // Fetch user IDs on mount
  useEffect(() => {
    const fetchUserIds = async () => {
      try {
        const res = await fetch("https://your-backend-url.com/api/user-ids");
        if (!res.ok) throw new Error("Failed to fetch user IDs");
        const data = await res.json(); // should return array like [{id:1}, {id:2}, ...]
        setUserIds(data);
      } catch (err) {
        console.error(err);
        alert("Error fetching user IDs");
      }
    };

    fetchUserIds();
  }, []);

  // Fetch user details when a user ID is selected
  useEffect(() => {
    if (!selectedUserId) {
      setName("");
      setEmail("");
      setPhoneNumber("");
      setClassName("");
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const res = await fetch(
          `https://your-backend-url.com/api/user/${selectedUserId}`
        );
        if (!res.ok) throw new Error("Failed to fetch user details");
        const user = await res.json();
        setName(user.name || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phone_number || "");
        setClassName(user.class_name || "");
      } catch (err) {
        console.error(err);
        alert("Error fetching user details");
      }
    };

    fetchUserDetails();
  }, [selectedUserId]);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert("Please select a user to delete");
      return;
    }

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

        <form onSubmit={handleDelete}>
          {/* User selection dropdown */}
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            <option value="">Select a user</option>
            {userIds.map((u) => (
              <option key={u.id} value={u.id}>
                User ID: {u.id}
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
            <button type="submit" disabled={!selectedUserId}>
              Delete User
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteUserModal;
