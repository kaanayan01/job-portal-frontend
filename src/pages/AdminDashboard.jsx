import React, { useEffect, useState } from "react";
import "../App.css";
import { apiFetch, getToken} from "../api";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [approvedEmployers, setApprovedEmployers] = useState([]);
  const [rejectedEmployers, setRejectedEmployers] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeEmployers: 0,
    jobsPosted: 0,
    totalPayments: 0,
    pendingApprovals: 0,
    totalApplications: 0,
    premiumUsers: 0
  });
  const [approvingId, setApprovingId] = useState(null);
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    try {
      const response = await apiFetch(`/api/admins/analytics/dashboard`);
      
      if (response.status === 200) {
        const json = await response.json();
        const totalRevenue = json.data?.totalPayments || json.data?.totalRevenue || 0;
        setAnalytics({
          totalUsers: json.data?.totalUsers || 0,
          activeEmployers: json.data?.activeEmployers || 0,
          jobsPosted: json.data?.jobsPosted || json.data?.totalJobs || 0,
          totalPayments: typeof totalRevenue === 'number' ? totalRevenue : parseFloat(totalRevenue) || 0,
          pendingApprovals: json.data?.pendingApprovals || 0,
          totalApplications: json.data?.totalApplications || 0,
          premiumUsers: json.data?.premiumUsers || (json.data?.premiumEmployers || 0) + (json.data?.premiumJobSeekers || 0)
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const fetchPendingEmployers = async () => {
    try {
      const response = await apiFetch(`/api/admins/employers/pending`);
      
      if (response.status === 200) {
        const json = await response.json();
        const pending = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        console.log("Pending employers fetched:", pending.length);
        setPendingEmployers(pending);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch pending employers:", response.status, errorText);
        setPendingEmployers([]);
      }
    } catch (error) {
      console.error("Error fetching pending employers:", error);
      setPendingEmployers([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch Approved Employers
      const approvedRes = await apiFetch(`/api/admins/employers/approved`);
      if (approvedRes.status === 200) {
        const json = await approvedRes.json();
        const approvedList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        console.log("Approved employers fetched:", approvedList.length);
        setApprovedEmployers(approvedList);
        setEmployees(approvedList); // Set as default for "employers" tab
      } else {
        const errorText = await approvedRes.text();
        console.error("Failed to fetch approved employers:", approvedRes.status, errorText);
        setApprovedEmployers([]);
      }
      
      // Fetch Rejected Employers
      const rejectedRes = await apiFetch(`/api/admins/employers/rejected`);
      if (rejectedRes.status === 200) {
        const json = await rejectedRes.json();
        const rejectedList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        console.log("Rejected employers fetched:", rejectedList.length);
        setRejectedEmployers(rejectedList);
      } else {
        const errorText = await rejectedRes.text();
        console.error("Failed to fetch rejected employers:", rejectedRes.status, errorText);
        setRejectedEmployers([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setApprovedEmployers([]);
      setRejectedEmployers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEmployer = async (employerId, status) => {
    try {
      setApprovingId(employerId);
      const response = await apiFetch(`/api/admins/employer/${employerId}/status?status=${status}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.status === 200) {
        setPendingEmployers(pendingEmployers.filter(emp => emp.employerId !== employerId));
        // Refresh employer lists
        await fetchEmployees();
        alert(`Employer ${status.toLowerCase()} successfully`);
      } else {
        alert("Failed to update employer status");
      }
    } catch (error) {
      console.error("Error updating employer status:", error);
      alert("Error updating status");
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchEmployees();
    fetchPendingEmployers();
  }, []);

  // Refresh data when tab changes
  useEffect(() => {
    if (activeTab === "employers" || activeTab === "approved" || activeTab === "rejected") {
      fetchEmployees();
    }
    if (activeTab === "approvals") {
      fetchPendingEmployers();
    }
  }, [activeTab]);

  const handleRowClick = (employer) => {
    navigate("/admin/company/"+ employer.employerId, { state: { employer } });
  }

  return (
    <div className="main-container">
      <h2>📊 Admin Dashboard</h2>

      {/* Navigation Buttons - Right under the title */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/admin/users")}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          👥 Users
        </button>
        <button
          onClick={() => navigate("/admin/jobs")}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          💼 Jobs
        </button>
        <button
          onClick={() => navigate("/admin/applications")}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          📋 Applications
        </button>
        <button
          onClick={() => navigate("/admin/payments")}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          💰 Payments
        </button>
        <button
          onClick={() => navigate("/admin/subscriptions")}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          💳 Subscriptions
        </button>
        <button
          onClick={() => navigate("/admin/premium-users")}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          ⭐ Premium Users
        </button>
        <button
          onClick={() => navigate("/admin/reports")}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          📊 Reports
        </button>
      </div>

      {/* Tab Navigation for Dashboard Views */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #e0e0e0", paddingBottom: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "10px 20px",
            background: activeTab === "overview" ? "#667eea" : "#f0f0f0",
            color: activeTab === "overview" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          📈 Overview
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
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          🏢 All Employers ({approvedEmployers.length + rejectedEmployers.length})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          style={{
            padding: "10px 20px",
            background: activeTab === "approved" ? "#28a745" : "#f0f0f0",
            color: activeTab === "approved" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          ✅ Approved ({approvedEmployers.length})
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          style={{
            padding: "10px 20px",
            background: activeTab === "rejected" ? "#dc3545" : "#f0f0f0",
            color: activeTab === "rejected" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          ❌ Rejected ({rejectedEmployers.length})
        </button>
        <button
          onClick={() => setActiveTab("approvals")}
          style={{
            padding: "10px 20px",
            background: activeTab === "approvals" ? "#667eea" : "#f0f0f0",
            color: activeTab === "approvals" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          ⏳ Pending Approvals ({pendingEmployers.length})
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div>
          {/* Metrics Section */}
          <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            <div className="metric-card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "20px", borderRadius: "8px" }}>
              <div className="metric-label" style={{ fontSize: "0.9rem", opacity: 0.9 }}>👥 Total Users</div>
              <div className="metric-value" style={{ fontSize: "2rem", fontWeight: "bold" }}>{analytics.totalUsers}</div>
            </div>
            <div className="metric-card" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white", padding: "20px", borderRadius: "8px" }}>
              <div className="metric-label" style={{ fontSize: "0.9rem", opacity: 0.9 }}>🏢 Active Employers</div>
              <div className="metric-value" style={{ fontSize: "2rem", fontWeight: "bold" }}>{analytics.activeEmployers}</div>
            </div>
            <div className="metric-card" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white", padding: "20px", borderRadius: "8px" }}>
              <div className="metric-label" style={{ fontSize: "0.9rem", opacity: 0.9 }}>💼 Jobs Posted</div>
              <div className="metric-value" style={{ fontSize: "2rem", fontWeight: "bold" }}>{analytics.jobsPosted}</div>
            </div>
            <div className="metric-card" style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white", padding: "20px", borderRadius: "8px" }}>
              <div className="metric-label" style={{ fontSize: "0.9rem", opacity: 0.9 }}>💰 Total Revenue (₹)</div>
              <div className="metric-value" style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {typeof analytics.totalPayments === 'number' 
                  ? analytics.totalPayments.toLocaleString() 
                  : analytics.totalPayments?.toString() || '0'}
              </div>
            </div>
            <div className="metric-card" style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white", padding: "20px", borderRadius: "8px" }}>
              <div className="metric-label" style={{ fontSize: "0.9rem", opacity: 0.9 }}>⏳ Pending Approvals</div>
              <div className="metric-value" style={{ fontSize: "2rem", fontWeight: "bold" }}>{analytics.pendingApprovals}</div>
            </div>
            <div className="metric-card" style={{ background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", color: "#333", padding: "20px", borderRadius: "8px" }}>
              <div className="metric-label" style={{ fontSize: "0.9rem", opacity: 0.9 }}>📋 Total Applications</div>
              <div className="metric-value" style={{ fontSize: "2rem", fontWeight: "bold" }}>{analytics.totalApplications}</div>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYERS TAB */}
      {activeTab === "employers" && (
        <div className="section">
          <h3>All Employers ({approvedEmployers.length + rejectedEmployers.length})</h3>
          {loading ? (
            <p>Loading employers...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ textAlign: "left", padding: "12px" }}>ID</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Company</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Phone</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Status</th>
                    <th style={{ textAlign: "center", padding: "12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...approvedEmployers, ...rejectedEmployers].length > 0 ? (
                    [...approvedEmployers, ...rejectedEmployers].map((emp) => (
                      <tr key={emp.employerId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "12px" }}>{emp.employerId}</td>
                        <td style={{ padding: "12px" }}>{emp.contactEmail || emp.email || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.companyName || emp.name || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactNumber || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            background: emp.approvalStatus === "APPROVED" ? "#d4edda" : emp.approvalStatus === "PENDING" ? "#fff3cd" : "#f8d7da",
                            color: emp.approvalStatus === "APPROVED" ? "#155724" : emp.approvalStatus === "PENDING" ? "#856404" : "#721c24"
                          }}>
                            {emp.approvalStatus || "PENDING"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleRowClick(emp)}
                            style={{
                              padding: "6px 12px",
                              background: "#667eea",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.9rem"
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="no-employers">
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                        No employers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* APPROVED EMPLOYERS TAB */}
      {activeTab === "approved" && (
        <div className="section">
          <h3>✅ Approved Employers ({approvedEmployers.length})</h3>
          {loading ? (
            <p>Loading approved employers...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ textAlign: "left", padding: "12px" }}>ID</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Company Name</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Phone</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Joined</th>
                    <th style={{ textAlign: "center", padding: "12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedEmployers.length > 0 ? (
                    approvedEmployers.map((emp) => (
                      <tr key={emp.employerId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "12px" }}>{emp.employerId}</td>
                        <td style={{ padding: "12px", fontWeight: "500" }}>{emp.companyName || emp.name || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactEmail || emp.email || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactNumber || "N/A"}</td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                          {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleRowClick(emp)}
                            style={{
                              padding: "6px 12px",
                              background: "#667eea",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.9rem"
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="no-approved">
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                        No approved employers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REJECTED EMPLOYERS TAB */}
      {activeTab === "rejected" && (
        <div className="section">
          <h3>❌ Rejected Employers ({rejectedEmployers.length})</h3>
          {loading ? (
            <p>Loading rejected employers...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ textAlign: "left", padding: "12px" }}>ID</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Company Name</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Phone</th>
                    <th style={{ textAlign: "left", padding: "12px" }}>Joined</th>
                    <th style={{ textAlign: "center", padding: "12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedEmployers.length > 0 ? (
                    rejectedEmployers.map((emp) => (
                      <tr key={emp.employerId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "12px" }}>{emp.employerId}</td>
                        <td style={{ padding: "12px", fontWeight: "500" }}>{emp.companyName || emp.name || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactEmail || emp.email || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactNumber || "N/A"}</td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                          {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleRowClick(emp)}
                            style={{
                              padding: "6px 12px",
                              background: "#667eea",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.9rem"
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="no-rejected">
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                        No rejected employers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* APPROVALS TAB */}
      {activeTab === "approvals" && (
        <div className="section">
          <h3>⏳ Pending Employer Approvals ({pendingEmployers.length})</h3>
          {pendingEmployers.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", background: "#f9f9f9", borderRadius: "8px" }}>
              <p style={{ color: "#999", fontSize: "1.1rem" }}>✅ No pending approvals</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
              {pendingEmployers.map((emp) => (
                <div key={emp.employerId} style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "20px",
                  background: "#fafafa",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                  <h4 style={{ margin: "0 0 12px 0", color: "#333" }}>{emp.companyName || emp.name || "Company Name"}</h4>
                  <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "12px" }}>
                    <p style={{ margin: "4px 0" }}>📧 <strong>Email:</strong> {emp.contactEmail || emp.email || "N/A"}</p>
                    <p style={{ margin: "4px 0" }}>📱 <strong>Phone:</strong> {emp.contactNumber || "N/A"}</p>
                    <p style={{ margin: "4px 0" }}>🏷️ <strong>Status:</strong> {emp.approvalStatus}</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button
                      onClick={() => handleApproveEmployer(emp.employerId, "APPROVED")}
                      disabled={approvingId === emp.employerId}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: approvingId === emp.employerId ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        opacity: approvingId === emp.employerId ? 0.6 : 1
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleApproveEmployer(emp.employerId, "REJECTED")}
                      disabled={approvingId === emp.employerId}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: approvingId === emp.employerId ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        opacity: approvingId === emp.employerId ? 0.6 : 1
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
