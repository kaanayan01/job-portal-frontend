import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import "../App.css";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/payments`);
      
      if (response.status === 200) {
        const json = await response.json();
        setPayments(Array.isArray(json.data) ? json.data : []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiFetch(`/api/admin/analytics`);
      
      if (response.status === 200) {
        const json = await response.json();
        setStats({
          totalRevenue: json.data?.totalPayments || 0,
          successfulPayments: json.data?.successfulPayments || 0,
          pendingPayments: json.data?.pendingPayments || 0,
          failedPayments: json.data?.failedPayments || 0
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filteredPayments = filterStatus === "all" 
    ? payments 
    : payments.filter(p => p.paymentStatus?.toUpperCase() === filterStatus.toUpperCase());

  const getStatusBadgeStyle = (status) => {
    switch(status?.toUpperCase()) {
      case "SUCCESS":
        return { background: "#d4edda", color: "#155724" };
      case "PENDING":
        return { background: "#fff3cd", color: "#856404" };
      case "FAILED":
        return { background: "#f8d7da", color: "#721c24" };
      default:
        return { background: "#e2e3e5", color: "#383d41" };
    }
  };

  return (
    <div className="main-container">
      <h2>💰 Payment Management</h2>
      <p className="section-subtitle">Track all payment transactions and subscription revenue</p>

      {/* Metrics */}
      <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white", padding: "20px", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>💰 Total Revenue</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>₹{stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white", padding: "20px", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>✅ Successful</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.successfulPayments}</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white", padding: "20px", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>⏳ Pending</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.pendingPayments}</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white", padding: "20px", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>❌ Failed</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.failedPayments}</div>
        </div>
      </div>

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
          All ({payments.length})
        </button>
        <button
          onClick={() => setFilterStatus("SUCCESS")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "SUCCESS" ? "#28a745" : "#f0f0f0",
            color: filterStatus === "SUCCESS" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Success ({payments.filter(p => p.status?.toUpperCase() === "SUCCESS").length})
        </button>
        <button
          onClick={() => setFilterStatus("PENDING")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "PENDING" ? "#ffc107" : "#f0f0f0",
            color: filterStatus === "PENDING" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Pending ({payments.filter(p =>{ console.log(p.status, p.status?.toUpperCase() === "PENDING") ; return p.status?.toUpperCase() === "PENDING" }).length})
        </button>
        <button
          onClick={() => setFilterStatus("FAILED")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "FAILED" ? "#dc3545" : "#f0f0f0",
            color: filterStatus === "FAILED" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Failed ({payments.filter(p => p.status?.toUpperCase() === "FAILED").length})
        </button>
      </div>

      {loading ? (
        <p>Loading payments...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "12px" }}>Payment ID</th>
                <th style={{ textAlign: "left", padding: "12px" }}>User/Email</th>
                <th style={{ textAlign: "right", padding: "12px" }}>Amount</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Type</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.paymentId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{payment.paymentId}</td>
                    <td style={{ padding: "12px" }}>{payment.userEmail || payment.userName || "N/A"}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>₹{payment.amount?.toLocaleString() || "0"}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        ...getStatusBadgeStyle(payment.paymentStatus)
                      }}>
                        {payment.paymentStatus || "PENDING"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>{payment.paymentType || "N/A"}</td>
                    <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="no-payments">
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                    No payments found
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

export default AdminPayments;