import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import "../App.css";

function EmployerJobList() {
  const navigate = useNavigate();
  const employer = useSelector(state => state.employer?.employer);
  const employerId = employer?.employerId || localStorage.getItem("employerId");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive, closed

  useEffect(() => {
    if (employerId) {
      fetchEmployerJobs();
    } else {
      setError("Employer ID not found");
      setLoading(false);
    }
  }, [employerId]);

  const fetchEmployerJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch(`/api/jobs/employer/${employerId}`);

      if (res.status === 200) {
        const json = await res.json();
        const jobsList = Array.isArray(json.data) ? json.data : [];
        setJobs(jobsList);
        console.log("Employer jobs fetched:", jobsList);
      } else {
        const json = await res.json();
        setError(json.message || "Failed to fetch jobs");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Error loading jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on selected status
  const filteredJobs = filterStatus === "all" 
    ? jobs 
    : jobs.filter(job => (job.status || 'ACTIVE').toUpperCase() === filterStatus.toUpperCase());

  const handleViewApplicants = (jobId) => {
    navigate(`/employer/applicants/${jobId}`);
  };

  const handleEditJob = (jobId) => {
    // TODO: Implement edit job functionality
    alert("Edit job functionality coming soon");
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }
    
    try {
      const res = await apiFetch(`/api/jobs/${jobId}`, {
        method: "DELETE"
      });

      if (res.status === 200) {
        setJobs(jobs.filter(j => j.jobId !== jobId));
        alert("Job deleted successfully");
      } else {
        const json = await res.json();
        setError(json.message || "Failed to delete job");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      setError("Error deleting job. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <h2>My Job Posts</h2>
        <p>Loading your jobs...</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>My Job Posts</h2>
        <button onClick={() => navigate("/employer/create-job")} className="primary-btn">
          + Post New Job
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          ✕ {error}
        </div>
      )}

      {/* Status Filter */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button 
          onClick={() => setFilterStatus("all")}
          style={{
            background: filterStatus === "all" ? "#667eea" : "#e0e0e0",
            color: filterStatus === "all" ? "white" : "#333",
            border: "none",
            padding: "8px 16px",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          All ({jobs.length})
        </button>
        {["ACTIVE", "INACTIVE"].map(status => {
          const count = jobs.filter(j => (j.status || 'ACTIVE').toUpperCase() === status).length;
          return (
            <button 
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                background: filterStatus === status ? "#667eea" : "#e0e0e0",
                color: filterStatus === status ? "white" : "#333",
                border: "none",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              {status} ({jobs.filter(j => (j.status || 'ACTIVE').toUpperCase() === status).length})
            </button>
          );
        })}
      </div>

      {filteredJobs.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "#f9f9f9",
          borderRadius: "8px",
          color: "#999",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {filteredJobs.map((job) => (
            <div 
              key={job.jobId} 
              style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease"
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "1.1rem" }}>
                    {job.title}
                  </h3>
                  <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "0.95rem" }}>
                    📍 {job.jobLocation || "N/A"}
                  </p>
                  
                  <div style={{ display: "flex", gap: "20px", fontSize: "0.9rem", color: "#555", marginBottom: "12px" }}>
                    <div>
                      <span style={{ fontWeight: "600", color: "#333" }}>Status:</span>
                      <br />
                      <span className={`status-badge status-${(job.status || 'ACTIVE').toLowerCase()}`}>
                        {job.status || 'ACTIVE'}
                      </span>
                    </div>
                    {/* <div>
                      <span style={{ fontWeight: "600", color: "#333" }}>Applicants:</span>
                      <br />
                      <span>{job.applicantCount || 0}</span>
                    </div> */}
                    <div>
                      <span style={{ fontWeight: "600", color: "#333" }}>Posted:</span>
                      <br />
                      <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button 
                    onClick={() => handleViewApplicants(job.jobId)}
                    style={{
                      background: "#667eea",
                      color: "white",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      whiteSpace: "nowrap"
                    }}
                    title="View applicants for this job"
                  >
                    👥 View
                  </button>
                  <button 
                    onClick={() => handleDeleteJob(job.jobId)}
                    style={{
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      whiteSpace: "nowrap"
                    }}
                    title="Delete this job"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployerJobList;