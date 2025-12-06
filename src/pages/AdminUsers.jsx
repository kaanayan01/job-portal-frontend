import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import "../App.css";

function AdminUsers() {
  const [jobSeekers, setJobSeekers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("job-seekers");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch Job Seekers
      const seekerRes = await apiFetch(`/api/job-seekers`);
      if (seekerRes.status === 200) {
        const json = await seekerRes.json();
        setJobSeekers(Array.isArray(json.data) ? json.data : []);
      }

      // Fetch Employers
      const empRes = await apiFetch(`/api/employers`);
      if (empRes.status === 200) {
        const json = await empRes.json();
        setEmployers(Array.isArray(json.data) ? json.data : []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <h2>👥 Users Management</h2>
      <p className="section-subtitle">Manage job seekers and employers on the platform</p>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #e0e0e0", paddingBottom: "10px" }}>
        <button
          onClick={() => setActiveTab("job-seekers")}
          style={{
            padding: "10px 20px",
            background: activeTab === "job-seekers" ? "#667eea" : "#f0f0f0",
            color: activeTab === "job-seekers" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Job Seekers ({jobSeekers.length})
        </button>
        <button
          onClick={() => setActiveTab("employers")}
          style={{
            padding: "10px 20px",
            background: activeTab === "employers" ? "#667eea" : "#f0f0f0",
            color: activeTab === "employers" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Employers ({employers.length})
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          {/* Job Seekers Tab */}
          {activeTab === "job-seekers" && (
            <div style={{ overflowX: "auto" }}>
              <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ textAlign: "left", padding: "12px" }}>ID</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Phone</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Experience</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {jobSeekers.length > 0 ? (
                    jobSeekers.map((seeker) => (
                      <tr key={seeker.jobSeekerId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "12px" }}>{seeker.jobSeekerId}</td>
                        <td style={{ padding: "12px", fontWeight: "500" }}>
                          {seeker.firstName || "N/A"} {seeker.lastName || ""}
                        </td>
                        <td style={{ padding: "12px" }}>{seeker.email || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{seeker.phoneNumber || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{seeker.yearsOfExperience || "N/A"} years</td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                          {seeker.createdAt ? new Date(seeker.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="no-seekers">
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                        No job seekers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Employers Tab */}
          {activeTab === "employers" && (
            <div style={{ overflowX: "auto" }}>
              <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ textAlign: "left", padding: "12px" }}>ID</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Company Name</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Phone</th>
                    <th style={{ textAlign: "center", padding: "12px" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.length > 0 ? (
                    employers.map((emp) => (
                      <tr key={emp.employerId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "12px" }}>{emp.employerId}</td>
                        <td style={{ padding: "12px", fontWeight: "500" }}>{emp.companyName || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactEmail || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactNumber || "N/A"}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <span style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            background: emp.approvalStatus === "APPROVED" ? "#d4edda" : emp.approvalStatus === "PENDING" ? "#fff3cd" : "#f8d7da",
                            color: emp.approvalStatus === "APPROVED" ? "#155724" : emp.approvalStatus === "PENDING" ? "#856404" : "#721c24"
                          }}>
                            {emp.approvalStatus || "PENDING"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                          {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="no-employers">
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                        No employers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminUsers;