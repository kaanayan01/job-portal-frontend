import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import BackToDashboardButton from "../components/BackToDashboardButton";
import "../App.css";

function AdminReports() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analytics, setAnalytics] = useState({
    dashboardAnalytics: {},
    jobAnalytics: {},
    applicationAnalytics: {},
    userAnalytics: {}
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportForm, setReportForm] = useState({
    reportType: "",
    reportName: "",
    description: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchAllAnalytics();
    fetchReports();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch Dashboard Analytics
      const dashRes = await apiFetch(`/api/admins/analytics/dashboard`);
      if (dashRes.status === 200) {
        const json = await dashRes.json();
        setAnalytics(prev => ({ ...prev, dashboardAnalytics: json.data || {} }));
      }

      // Fetch Job Analytics
      const jobRes = await apiFetch(`/api/admins/analytics/jobs`);
      if (jobRes.status === 200) {
        const json = await jobRes.json();
        setAnalytics(prev => ({ ...prev, jobAnalytics: json.data || {} }));
      }

      // Fetch Application Analytics
      const appRes = await apiFetch(`/api/admins/analytics/applications`);
      if (appRes.status === 200) {
        const json = await appRes.json();
        setAnalytics(prev => ({ ...prev, applicationAnalytics: json.data || {} }));
      }

      // Fetch User Analytics
      const userRes = await apiFetch(`/api/admins/analytics/users`);
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

  const fetchReports = async () => {
    try {
      const response = await apiFetch(`/api/admins/reports`);
      
      if (response.status === 200) {
        const json = await response.json();
        setReports(Array.isArray(json.data) ? json.data : []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const reportData = {
        reportType: reportForm.reportType,
        reportName: reportForm.reportName,
        description: reportForm.description,
        startDate: reportForm.startDate,
        endDate: reportForm.endDate
      };

      const response = await apiFetch(`/api/admins/reports/generate`, {
        method: "POST",
        body: JSON.stringify(reportData)
      });

      if (response.status === 200) {
        alert("Report generated successfully");
        await fetchReports();
        setReportForm({
          reportType: "",
          reportName: "",
          description: "",
          startDate: "",
          endDate: ""
        });
      } else {
        alert("Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report");
    } finally {
      setGeneratingReport(false);
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
      <BackToDashboardButton />
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
        <button
          onClick={() => setActiveTab("reports")}
          style={{
            padding: "10px 20px",
            background: activeTab === "reports" ? "#667eea" : "#f0f0f0",
            color: activeTab === "reports" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          📄 Generated Reports ({reports.length})
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

          {/* Generated Reports */}
          {activeTab === "reports" && (
            <div>
              {/* Report Generation Form */}
              <div style={{ 
                padding: "20px", 
                background: "#f9f9f9", 
                borderRadius: "8px", 
                marginBottom: "30px",
                border: "1px solid #e0e0e0"
              }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Generate New Report</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Report Type</label>
                    <input
                      type="text"
                      value={reportForm.reportType}
                      onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}
                      placeholder="e.g., Monthly Summary"
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Report Name</label>
                    <input
                      type="text"
                      value={reportForm.reportName}
                      onChange={(e) => setReportForm({ ...reportForm, reportName: e.target.value })}
                      placeholder="Enter report name"
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Start Date</label>
                    <input
                      type="date"
                      value={reportForm.startDate}
                      onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>End Date</label>
                    <input
                      type="date"
                      value={reportForm.endDate}
                      onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Description</label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Report description..."
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      resize: "vertical"
                    }}
                  />
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport || !reportForm.reportType || !reportForm.reportName}
                  style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    background: generatingReport ? "#ccc" : "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: generatingReport ? "not-allowed" : "pointer",
                    fontWeight: "500"
                  }}
                >
                  {generatingReport ? "Generating..." : "Generate Report"}
                </button>
              </div>

              {/* Reports List */}
              <div style={{ overflowX: "auto" }}>
                <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th style={{ textAlign: "left", padding: "12px" }}>Report ID</th>
                      <th style={{ textAlign: "left", padding: "12px" }}>Report Name</th>
                      <th style={{ textAlign: "left", padding: "12px" }}>Type</th>
                      <th style={{ textAlign: "left", padding: "12px" }}>Description</th>
                      <th style={{ textAlign: "left", padding: "12px" }}>Generated Date</th>
                      <th style={{ textAlign: "center", padding: "12px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <tr key={report.reportId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                          <td style={{ padding: "12px" }}>{report.reportId}</td>
                          <td style={{ padding: "12px", fontWeight: "500" }}>{report.reportName || report.reportType || "N/A"}</td>
                          <td style={{ padding: "12px" }}>{report.reportType || "N/A"}</td>
                          <td style={{ padding: "12px", maxWidth: "300px" }}>
                            <div style={{ 
                              overflow: "hidden", 
                              textOverflow: "ellipsis", 
                              whiteSpace: "nowrap" 
                            }}>
                              {report.description || report.content || "N/A"}
                            </div>
                          </td>
                          <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                            {report.generatedDate 
                              ? new Date(report.generatedDate).toLocaleDateString() 
                              : report.createdAt 
                              ? new Date(report.createdAt).toLocaleDateString() 
                              : "N/A"}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await apiFetch(`/api/admins/reports/${report.reportId}`);
                                  if (response.status === 200) {
                                    const json = await response.json();
                                    alert(`Report Details:\n${JSON.stringify(json.data, null, 2)}`);
                                  }
                                } catch (error) {
                                  console.error("Error fetching report:", error);
                                }
                              }}
                              style={{
                                padding: "6px 12px",
                                background: "#667eea",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.85rem"
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr key="no-reports">
                        <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                          No reports generated yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminReports;