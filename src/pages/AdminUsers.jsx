import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import BackToDashboardButton from "../components/BackToDashboardButton";
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
      
      // Fetch Job Seekers using admin endpoint
      const seekerRes = await apiFetch(`/api/admins/job-seekers`);
      console.log("Job Seekers Response Status:", seekerRes.status);
      
      if (seekerRes.status === 200) {
        const json = await seekerRes.json();
        console.log("Job Seekers Response JSON:", json);
        const seekers = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        console.log("Job Seekers parsed:", seekers.length, seekers);
        setJobSeekers(seekers);
      } else {
        const errorText = await seekerRes.text();
        console.error("Failed to fetch job seekers:", seekerRes.status, errorText);
        setJobSeekers([]);
        // Don't show alert for 401/403 as it might be auth issue
        if (seekerRes.status !== 401 && seekerRes.status !== 403) {
          alert(`Failed to fetch job seekers: ${seekerRes.status} - ${errorText}`);
        }
      }

      // Try to fetch all employers at once first, fallback to separate calls
      let allEmployers = [];
      const allEmployersRes = await apiFetch(`/api/admins/employers`);
      console.log("All Employers Response Status:", allEmployersRes.status);
      
      if (allEmployersRes.status === 200) {
        const json = await allEmployersRes.json();
        console.log("All Employers Response JSON:", json);
        allEmployers = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        console.log("All employers fetched:", allEmployers.length);
      } else {
        // Fallback: Fetch separately
        console.log("Falling back to separate employer endpoints");
        const approvedRes = await apiFetch(`/api/admins/employers/approved`);
        const rejectedRes = await apiFetch(`/api/admins/employers/rejected`);
        const pendingRes = await apiFetch(`/api/admins/employers/pending`);
        
        let approvedList = [];
        let rejectedList = [];
        let pendingList = [];
        
        if (approvedRes.status === 200) {
          const json = await approvedRes.json();
          approvedList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          console.log("Approved employers:", approvedList.length);
        }
        
        if (rejectedRes.status === 200) {
          const json = await rejectedRes.json();
          rejectedList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          console.log("Rejected employers:", rejectedList.length);
        }
        
        if (pendingRes.status === 200) {
          const json = await pendingRes.json();
          pendingList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          console.log("Pending employers:", pendingList.length);
        }

        allEmployers = [...approvedList, ...rejectedList, ...pendingList];
      }

      console.log("Total employers:", allEmployers.length, allEmployers);
      setEmployers(allEmployers);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert(`Error fetching users: ${error.message}`);
      setJobSeekers([]);
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <BackToDashboardButton />
      <h2>👥 Users Management</h2>
      <p className="section-subtitle">Manage job seekers and employers on the platform</p>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #e0e0e0", paddingBottom: "10px", flexWrap: "wrap" }}>
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
          All Employers ({employers.length})
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
                    <th style={{ textAlign: "left", padding: "12px" }}>Subscription Type</th>
                    {/* <th style={{ textAlign: "left", padding: "12px" }}>Resume</th> */}
                    <th style={{ textAlign: "left", padding: "12px" }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {jobSeekers.length > 0 ? (
                    jobSeekers.map((seeker) => (
                      <tr key={seeker.jobSeekerId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "12px" }}>{seeker.jobSeekerId}</td>
                        <td style={{ padding: "12px", fontWeight: "500" }}>
                          {seeker.firstName || seeker.name || "N/A"} {seeker.lastName || ""}
                        </td>
                        <td style={{ padding: "12px" }}>{seeker.email || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            background: seeker.subscriptionType === "PREMIUM" ? "#fff3cd" : "#e3f2fd",
                            color: seeker.subscriptionType === "PREMIUM" ? "#856404" : "#1976d2"
                          }}>
                            {seeker.subscriptionType || "FREE"}
                          </span>
                        </td>
                        {/* <td style={{ padding: "12px" }}>
                          {seeker.resumeFile ? (
                            <a href={seeker.resumeFile} target="_blank" rel="noopener noreferrer" style={{ color: "#667eea", textDecoration: "underline" }}>
                              View Resume
                            </a>
                          ) : "N/A"}
                        </td> */}
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

          {/* All Employers Tab */}
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