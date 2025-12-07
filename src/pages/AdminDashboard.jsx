import React, { useEffect, useState } from "react";
import "../App.css";
import { apiFetch, getToken} from "../api";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("employers");
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
      const response = await apiFetch(`/api/admin/analytics`);
      
      if (response.status === 200) {
        const json = await response.json();
        setAnalytics({
          totalUsers: json.data?.totalUsers || 0,
          activeEmployers: json.data?.activeEmployers || 0,
          jobsPosted: json.data?.jobsPosted || 0,
          totalPayments: json.data?.totalPayments || 0,
          pendingApprovals: json.data?.pendingApprovals || 0,
          totalApplications: json.data?.totalApplications || 0,
          premiumUsers: json.data?.premiumUsers || 0
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
        setPendingEmployers(Array.isArray(json.data) ? json.data : []);
      }
    } catch (error) {
      console.error("Error fetching pending employers:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await apiFetch(`/api/employers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== "success" && response.status !== 200) {
        console.log(response.message || "Invalid login");
        return;
      }

      if (response.status === 200) {
        const json = await response.json();
        setEmployees(json.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
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

  const handleRowClick = (employer) => {
    navigate("/admin/company/"+ employer.employerId, { state: { employer } });
  }

  return (
    <div className="main-container">
      <h2>📊 Admin Dashboard</h2>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #e0e0e0", paddingBottom: "10px", flexWrap: "wrap" }}>
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
          🏢 Employers
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
          ✅ Approvals ({pendingEmployers.length})
        </button>
        <button
          onClick={() => navigate("/jobs")}
          style={{
            padding: "10px 20px",
            background: "#f0f0f0",
            color: "#333",
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
          onClick={() => navigate("/admin/payments")}
          style={{
            padding: "10px 20px",
            background: "#f0f0f0",
            color: "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          💰 Payments
        </button>
      </div>

      {/* EMPLOYERS TAB */}
      {activeTab === "employers" && (
        <div className="section">
          <h3>All Employers</h3>
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
                  {Array.isArray(employees) && employees.length > 0 ? (
                    employees.map((emp) => (
                      <tr key={emp.employerId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "12px" }}>{emp.employerId}</td>
                        <td style={{ padding: "12px" }}>{emp.contactEmail}</td>
                        <td style={{ padding: "12px" }}>{emp.companyName || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{emp.contactNumber}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            background: emp.approvalStatus === "APPROVED" ? "#d4edda" : emp.approvalStatus === "PENDING" ? "#fff3cd" : "#f8d7da",
                            color: emp.approvalStatus === "APPROVED" ? "#155724" : emp.approvalStatus === "PENDING" ? "#856404" : "#721c24"
                          }}>
                            {emp.approvalStatus}
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
                  <h4 style={{ margin: "0 0 12px 0", color: "#333" }}>{emp.companyName || "Company Name"}</h4>
                  <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "12px" }}>
                    <p style={{ margin: "4px 0" }}>📧 <strong>Email:</strong> {emp.contactEmail}</p>
                    <p style={{ margin: "4px 0" }}>📱 <strong>Phone:</strong> {emp.contactNumber}</p>
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
