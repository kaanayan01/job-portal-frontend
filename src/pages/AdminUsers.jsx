import React from "react";
import "../App.css";

const DUMMY_USERS = [
  { id: 1, name: "Shruti", email: "shruti@example.com", role: "JOB_SEEKER" },
  { id: 2, name: "Rohan", email: "rohan@company.com", role: "EMPLOYER" },
  { id: 3, name: "System Admin", email: "admin@portal.com", role: "ADMIN" },
];

function AdminUsers() {
  return (
    <div className="main-container">
      <h2>Users Management</h2>
      <p className="section-subtitle">
        Backend: Admin/UserController to list, activate, deactivate users.
      </p>

      <div className="list-table">
        <div className="list-table-header">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
        </div>
        {DUMMY_USERS.map((u) => (
          <div key={u.id} className="list-table-row">
            <span>{u.name}</span>
            <span>{u.email}</span>
            <span>{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminUsers;