import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import "../App.css";

function AdminReports() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analytics, setAnalytics] = useState({
    dashboardAnalytics: {},
    jobAnalytics: {},
    applicationAnalytics: {},
    userAnalytics: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch Dashboard Analytics
      const dashRes = await apiFetch(`/api/admin/analytics/dashboard`);
      if (dashRes.status === 200) {
        const json = await dashRes.json();
        setAnalytics(prev => ({ ...prev, dashboardAnalytics: json.data || {} }));
      }

      // Fetch Job Analytics
      const jobRes = await apiFetch(`/api/admin/analytics/jobs`);
      if (jobRes.status === 200) {
        const json = await jobRes.json();
        setAnalytics(prev => ({ ...prev, jobAnalytics: json.data || {} }));
      }

      // Fetch Application Analytics
      const appRes = await apiFetch(`/api/admin/analytics/applications`);
      if (appRes.status === 200) {
        const json = await appRes.json();
        setAnalytics(prev => ({ ...prev, applicationAnalytics: json.data || {} }));
      }

      // Fetch User Analytics
      const userRes = await apiFetch(`/api/admin/analytics/users`);
      if (userRes.status === 200) {
        const json = await userRes.json();
        setAnalytics(prev => ({ ...prev, userAnalytics: json.data || {} }));
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalyticsCard = (title, data) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", textAlign: "center", color: "#999" }}>
          No data available
        </div>
      );
    }

    return (
      <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>{title}</h4>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e0e0e0" }}>
            <span style={{ color: "#666", fontWeight: "500" }}>{key}:</span>
            <span style={{ color: "#333", fontWeight: "600" }}>{typeof value === "number" ? value.toLocaleString() : value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="main-container">
      <h2>📊 Reports & Analytics</h2>
      <p className="section-subtitle">Comprehensive analytics and reporting dashboard</p>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #e0e0e0", paddingBottom: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            padding: "10px 20px",
            background: activeTab === "dashboard" ? "#667eea" : "#f0f0f0",
            color: activeTab === "dashboard" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          📈 Dashboard
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          style={{
            padding: "10px 20px",
            background: activeTab === "jobs" ? "#667eea" : "#f0f0f0",
            color: activeTab === "jobs" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          💼 Jobs
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          style={{
            padding: "10px 20px",
            background: activeTab === "applications" ? "#667eea" : "#f0f0f0",
            color: activeTab === "applications" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          📋 Applications
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "10px 20px",
            background: activeTab === "users" ? "#667eea" : "#f0f0f0",
            color: activeTab === "users" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          👥 Users
        </button>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <div>
          {/* Dashboard Analytics */}
          {activeTab === "dashboard" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {renderAnalyticsCard("Platform Overview", analytics.dashboardAnalytics)}
            </div>
          )}

          {/* Job Analytics */}
          {activeTab === "jobs" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {renderAnalyticsCard("Job Posting Analytics", analytics.jobAnalytics)}
            </div>
          )}

          {/* Application Analytics */}
          {activeTab === "applications" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {renderAnalyticsCard("Application Analytics", analytics.applicationAnalytics)}
            </div>
          )}

          {/* User Analytics */}
          {activeTab === "users" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {renderAnalyticsCard("User Analytics", analytics.userAnalytics)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminReports;