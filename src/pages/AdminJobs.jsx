import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";
import "../App.css";

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/jobs`);
      
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

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    setDeletingId(jobId);
    try {
      const response = await apiFetch(`/api/jobs/${jobId}`, {
        method: "DELETE"
      });

      if (response.status === 200 || response.status === 201) {
        // Remove the deleted job from the list
        setJobs(jobs.filter(job => job.jobId !== jobId));
        alert("Job deleted successfully!");
      } else {
        const errorData = await response.json();
        alert("Failed to delete job: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("An error occurred while deleting the job.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredJobs = filterStatus === "all" 
    ? jobs.filter(job => job.jobStatus?.toUpperCase() !== "DELETED")
    : jobs.filter(job => job.jobStatus?.toUpperCase() === filterStatus.toUpperCase() && job.jobStatus?.toUpperCase() !== "DELETED");

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
          Active ({jobs.filter(j => j.jobStatus?.toUpperCase() === "ACTIVE").length})
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
          Inactive ({jobs.filter(j => j.jobStatus?.toUpperCase() === "INACTIVE").length})
        </button>
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "12px" }}>Job Title</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Location</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Status</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Applicants</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr key={job.jobId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{job.jobTitle || "N/A"}</td>
                    <td style={{ padding: "12px" }}>{job.jobLocation || "N/A"}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        ...getStatusBadgeStyle(job.jobStatus)
                      }}>
                        {job.jobStatus || "ACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#667eea" }}>
                      {applicantCounts[job.jobId] !== undefined ? applicantCounts[job.jobId] : "..."}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => navigate(`/employer/applicants/${job.jobId}`)}
                          style={{
                            padding: "8px 16px",
                            background: "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            transition: "all 0.3s"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#5568d3";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#667eea";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.jobId)}
                          disabled={deletingId === job.jobId}
                          style={{
                            padding: "8px 16px",
                            background: deletingId === job.jobId ? "#999" : "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: deletingId === job.jobId ? "not-allowed" : "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            transition: "all 0.3s"
                          }}
                          onMouseEnter={(e) => {
                            if (deletingId !== job.jobId) {
                              e.target.style.background = "#c82333";
                              e.target.style.transform = "translateY(-2px)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (deletingId !== job.jobId) {
                              e.target.style.background = "#dc3545";
                              e.target.style.transform = "translateY(0)";
                            }
                          }}
                        >
                          {deletingId === job.jobId ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="no-jobs">
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
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