import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import BackToDashboardButton from "../components/BackToDashboardButton";
import "../App.css";

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchApplications();
    fetchApplicationStats();
  }, []);

  useEffect(() => {
    if (filterStatus !== "all") {
      // Filter applications by status if needed
      // This depends on what status field exists in Application model
    }
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/admins/applications`);
      console.log("Applications Response Status:", response.status);
      
      if (response.status === 200) {
        const json = await response.json();
        console.log("Applications Response JSON:", json);
        const apps = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        console.log("Applications fetched:", apps.length);
        console.log("Sample application:", apps[0]);
        setApplications(apps);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch applications:", response.status, errorText);
        setApplications([]);
        if (response.status !== 401 && response.status !== 403) {
          alert(`Failed to fetch applications: ${response.status} - ${errorText}`);
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
      alert(`Error fetching applications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationStats = async () => {
    try {
      const response = await apiFetch(`/api/admins/applications/stats`);
      
      if (response.status === 200) {
        const json = await response.json();
        setStats(json.data || {});
      }
    } catch (error) {
      console.error("Error fetching application stats:", error);
    }
  };

  const filteredApplications = filterStatus === "all" 
    ? applications 
    : applications.filter(app => {
        // Adjust based on actual status field in Application model
        return app.status?.toUpperCase() === filterStatus.toUpperCase();
      });

  return (
    <div className="main-container">
      <BackToDashboardButton />
      <h2>📋 Applications Management</h2>
      <p className="section-subtitle">View and manage all job applications</p>

      {/* Statistics */}
      {Object.keys(stats).length > 0 && (
        <div className="metrics-grid" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "20px", 
          marginBottom: "30px" 
        }}>
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
              color: "white", 
              padding: "20px", 
              borderRadius: "8px" 
            }}>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={() => setFilterStatus("all")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "all" ? "#667eea" : "#f0f0f0",
            color: filterStatus === "all" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          All ({applications.length})
        </button>
        <button
          onClick={() => setFilterStatus("APPLIED")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "APPLIED" ? "#667eea" : "#f0f0f0",
            color: filterStatus === "APPLIED" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Applied ({applications.filter(a => a.status === "APPLIED").length})
        </button>
        <button
          onClick={() => setFilterStatus("REVIEWED")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "REVIEWED" ? "#667eea" : "#f0f0f0",
            color: filterStatus === "REVIEWED" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Reviewed ({applications.filter(a => a.status === "REVIEWED").length})
        </button>
        <button
          onClick={() => setFilterStatus("SHORTLISTED")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "SHORTLISTED" ? "#667eea" : "#f0f0f0",
            color: filterStatus === "SHORTLISTED" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Shortlisted ({applications.filter(a => a.status === "SHORTLISTED").length})
        </button>
        <button
          onClick={() => setFilterStatus("SELECTED")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "SELECTED" ? "#28a745" : "#f0f0f0",
            color: filterStatus === "SELECTED" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Selected ({applications.filter(a => a.status === "SELECTED").length})
        </button>
        <button
          onClick={() => setFilterStatus("REJECTED")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "REJECTED" ? "#dc3545" : "#f0f0f0",
            color: filterStatus === "REJECTED" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Rejected ({applications.filter(a => a.status === "REJECTED").length})
        </button>
      </div>

      {loading ? (
        <p>Loading applications...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "12px" }}>Application ID</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Job Seeker ID</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Job Seeker Name</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Job ID</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Job Title</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Employer/Company</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Applied Date</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr key={app.applicationId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{app.applicationId}</td>
                    <td style={{ padding: "12px" }}>{app.jobSeekerId || "N/A"}</td>
                    <td style={{ padding: "12px" }}>
                      {app.jobSeekerName || `Job Seeker #${app.jobSeekerId || "N/A"}`}
                    </td>
                    <td style={{ padding: "12px" }}>{app.jobId || "N/A"}</td>
                    <td style={{ padding: "12px" }}>{app.jobTitle || "N/A"}</td>
                    <td style={{ padding: "12px" }}>
                      {app.employerName || "N/A"}
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                      {app.appliedDate 
                        ? new Date(app.appliedDate).toLocaleDateString() 
                        : app.createdAt 
                        ? new Date(app.createdAt).toLocaleDateString() 
                        : "N/A"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        background: app.status === "SELECTED" ? "#d4edda" : 
                                   app.status === "REJECTED" ? "#f8d7da" : 
                                   app.status === "SHORTLISTED" ? "#cfe2ff" : 
                                   app.status === "REVIEWED" ? "#d1ecf1" : "#fff3cd",
                        color: app.status === "SELECTED" ? "#155724" : 
                               app.status === "REJECTED" ? "#721c24" : 
                               app.status === "SHORTLISTED" ? "#084298" : 
                               app.status === "REVIEWED" ? "#0c5460" : "#856404"
                      }}>
                        {app.status || "APPLIED"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="no-applications">
                  <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminApplications;

