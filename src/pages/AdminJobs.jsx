import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";
import BackToDashboardButton from "../components/BackToDashboardButton";
import "../App.css";

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const navigate = useNavigate();


  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/admins/jobs`);
      
      if (response.status === 200) {
        const json = await response.json();
        const jobsList = Array.isArray(json.data) ? json.data : [];
        setJobs(jobsList);
        
        // Fetch applicant counts for each job
        jobsList.forEach(job => {
          fetchApplicantCount(job.jobId);
        });
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicantCount = async (jobId) => {
    try {
      const response = await apiFetch(`/api/applications/job/${jobId}`);
      
      if (response.status === 200) {
        const json = await response.json();
        const applicants = Array.isArray(json.data) ? json.data : [];
        setApplicantCounts(prev => ({
          ...prev,
          [jobId]: applicants.length
        }));
      }
    } catch (error) {
      console.error(`Error fetching applicants for job ${jobId}:`, error);
      setApplicantCounts(prev => ({
        ...prev,
        [jobId]: 0
      }));
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      setUpdatingStatus(jobId);
      const response = await apiFetch(`/api/admins/jobs/${jobId}/status?status=${newStatus}`, {
        method: "PUT"
      });
      
      if (response.status === 200) {
        // Refresh jobs list
        await fetchJobs();
        alert(`Job status updated to ${newStatus} successfully`);
      } else {
        alert("Failed to update job status");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Error updating job status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const fetchJobsByStatus = async (status) => {
    try {
      setLoading(true);
      const endpoint = status === "ACTIVE" 
        ? `/api/admins/jobs/active`
        : status === "INACTIVE"
        ? `/api/admins/jobs/inactive`
        : `/api/admins/jobs`;
      
      const response = await apiFetch(endpoint);
      
      if (response.status === 200) {
        const json = await response.json();
        const jobsList = Array.isArray(json.data) ? json.data : [];
        setJobs(jobsList);
        
        jobsList.forEach(job => {
          fetchApplicantCount(job.jobId);
        });
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterStatus === "all") {
      fetchJobs();
    } else {
      fetchJobsByStatus(filterStatus);
    }
  }, [filterStatus]);

  const filteredJobs = filterStatus === "all" 
    ? jobs 
    : jobs.filter(job => (job.status || job.jobStatus)?.toUpperCase() === filterStatus.toUpperCase());

  const getStatusBadgeStyle = (status) => {
    switch(status?.toUpperCase()) {
      case "ACTIVE":
        return { background: "#d4edda", color: "#155724" };
      case "INACTIVE":
        return { background: "#f8d7da", color: "#721c24" };
      case "CLOSED":
        return { background: "#d1ecf1", color: "#0c5460" };
      default:
        return { background: "#e2e3e5", color: "#383d41" };
    }
  };

  return (
    <div className="main-container">
      <BackToDashboardButton />
      <h2>💼 Job Management</h2>
      <p className="section-subtitle">Manage all job postings across the platform</p>

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
          All ({jobs.length})
        </button>
        <button
          onClick={() => setFilterStatus("ACTIVE")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "ACTIVE" ? "#28a745" : "#f0f0f0",
            color: filterStatus === "ACTIVE" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Active ({jobs.filter(j => (j.status || j.jobStatus)?.toUpperCase() === "ACTIVE").length})
        </button>
        <button
          onClick={() => setFilterStatus("INACTIVE")}
          style={{
            padding: "10px 20px",
            background: filterStatus === "INACTIVE" ? "#dc3545" : "#f0f0f0",
            color: filterStatus === "INACTIVE" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Inactive ({jobs.filter(j => (j.status || j.jobStatus)?.toUpperCase() === "INACTIVE").length})
        </button>
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "12px" }}>Job ID</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Job Title</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Employer ID</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Location</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Salary</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Job Type</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Posted Date</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Applicants</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr key={job.jobId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{job.jobId}</td>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{job.title || job.jobTitle || "N/A"}</td>
                    <td style={{ padding: "12px" }}>{job.employerId || "N/A"}</td>
                    <td style={{ padding: "12px" }}>{job.jobLocation || job.location || "N/A"}</td>
                    <td style={{ padding: "12px" }}>{job.salary || "N/A"}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        background: "#e3f2fd",
                        color: "#1976d2"
                      }}>
                        {job.jobType || "N/A"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        ...getStatusBadgeStyle(job.status || job.jobStatus)
                      }}>
                        {job.status || job.jobStatus || "ACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.9rem", color: "#666" }}>
                      {job.postedDate 
                        ? new Date(job.postedDate).toLocaleDateString() 
                        : "N/A"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#667eea" }}>
                      {applicantCounts[job.jobId] !== undefined ? applicantCounts[job.jobId] : "..."}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => navigate(`/admin/applications?jobId=${job.jobId}`)}
                          style={{
                            padding: "6px 12px",
                            background: "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: "600"
                          }}
                        >
                          View Applications
                        </button>
                        {(job.status || job.jobStatus)?.toUpperCase() === "ACTIVE" ? (
                          <button
                            onClick={() => handleStatusUpdate(job.jobId, "INACTIVE")}
                            disabled={updatingStatus === job.jobId}
                            style={{
                              padding: "6px 12px",
                              background: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: updatingStatus === job.jobId ? "not-allowed" : "pointer",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              opacity: updatingStatus === job.jobId ? 0.6 : 1
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(job.jobId, "ACTIVE")}
                            disabled={updatingStatus === job.jobId}
                            style={{
                              padding: "6px 12px",
                              background: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: updatingStatus === job.jobId ? "not-allowed" : "pointer",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              opacity: updatingStatus === job.jobId ? 0.6 : 1
                            }}
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="no-jobs">
                  <td colSpan="10" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                    No jobs found
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

export default AdminJobs;