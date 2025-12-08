import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import BackToDashboardButton from "../components/BackToDashboardButton";
import "../App.css";

function AdminPremiumUsers() {
  const [premiumEmployers, setPremiumEmployers] = useState([]);
  const [premiumJobSeekers, setPremiumJobSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("employers");

  useEffect(() => {
    fetchPremiumUsers();
  }, []);

  const fetchPremiumUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch Premium Employers
      const empRes = await apiFetch(`/api/admins/employers/premium`);
      if (empRes.status === 200) {
        const json = await empRes.json();
        const employers = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        console.log("Premium employers fetched:", employers.length);
        setPremiumEmployers(employers);
      } else {
        const errorText = await empRes.text();
        console.error("Failed to fetch premium employers:", empRes.status, errorText);
        setPremiumEmployers([]);
      }

      // Fetch Premium Job Seekers
      const seekerRes = await apiFetch(`/api/admins/job-seekers/premium`);
      if (seekerRes.status === 200) {
        const json = await seekerRes.json();
        const seekers = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        console.log("Premium job seekers fetched:", seekers.length);
        setPremiumJobSeekers(seekers);
      } else {
        const errorText = await seekerRes.text();
        console.error("Failed to fetch premium job seekers:", seekerRes.status, errorText);
        setPremiumJobSeekers([]);
      }
    } catch (error) {
      console.error("Error fetching premium users:", error);
      setPremiumEmployers([]);
      setPremiumJobSeekers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <BackToDashboardButton />
      <h2>⭐ Premium Users</h2>
      <p className="section-subtitle">Manage premium employers and job seekers</p>

      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "20px", 
        borderBottom: "2px solid #e0e0e0", 
        paddingBottom: "10px",
        flexWrap: "wrap"
      }}>
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
          Premium Employers ({premiumEmployers.length})
        </button>
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
          Premium Job Seekers ({premiumJobSeekers.length})
        </button>
      </div>

      {loading ? (
        <p>Loading premium users...</p>
      ) : (
        <>
          {/* Premium Employers Tab */}
          {activeTab === "employers" && (
            <div style={{ overflowX: "auto" }}>
              <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ textAlign: "left", padding: "12px" }}>Employer ID</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Company Name</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Contact Number</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Subscription Type</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Premium Expiry</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {premiumEmployers.length > 0 ? (
                    premiumEmployers.map((emp) => (
                      <tr key={emp.employerId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "12px" }}>{emp.employerId}</td>
                        <td style={{ padding: "12px", fontWeight: "500" }}>{emp.companyName || emp.name || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactEmail || emp.email || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactNumber || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            background: "#fff3cd",
                            color: "#856404"
                          }}>
                            {emp.subscriptionType || emp.planType || "PREMIUM"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                          {emp.premiumExpiry 
                            ? new Date(emp.premiumExpiry).toLocaleDateString() 
                            : "N/A"}
                        </td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                          {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="no-premium-employers">
                      <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                        No premium employers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Premium Job Seekers Tab */}
          {activeTab === "job-seekers" && (
            <div style={{ overflowX: "auto" }}>
              <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ textAlign: "left", padding: "12px" }}>Job Seeker ID</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Resume</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Subscription Type</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Premium Expiry</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {premiumJobSeekers.length > 0 ? (
                    premiumJobSeekers.map((seeker) => (
                      <tr key={seeker.jobSeekerId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "12px" }}>{seeker.jobSeekerId}</td>
                        <td style={{ padding: "12px", fontWeight: "500" }}>
                          {seeker.firstName || seeker.name || "N/A"} {seeker.lastName || ""}
                        </td>
                        <td style={{ padding: "12px" }}>{seeker.email || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          {seeker.resumeFile ? (
                            <a href={seeker.resumeFile} target="_blank" rel="noopener noreferrer" style={{ color: "#667eea", textDecoration: "underline" }}>
                              View Resume
                            </a>
                          ) : "N/A"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            background: "#fff3cd",
                            color: "#856404"
                          }}>
                            {seeker.subscriptionType || seeker.planType || "PREMIUM"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                          {seeker.premiumExpiry 
                            ? new Date(seeker.premiumExpiry).toLocaleDateString() 
                            : "N/A"}
                        </td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                          {seeker.createdAt ? new Date(seeker.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="no-premium-seekers">
                      <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                        No premium job seekers found
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

export default AdminPremiumUsers;

