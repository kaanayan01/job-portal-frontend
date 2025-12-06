import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiFetch, getToken } from "../api";
import { useReduxUser } from "../hooks/useReduxUser";
import "./JobSeekerApplications.css";

function JobSeekerApplications() {
  const reduxUser = useReduxUser();
  const jobSeeker = useSelector(state => state.jobSeeker?.jobSeeker);
  const jobSeekerId = reduxUser?.userId || jobSeeker?.jobSeekerId;
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [jobSeekerId]);

  const fetchApplications = async () => {
    if (!jobSeekerId) {
      setError("Job Seeker ID not found. Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = getToken();
      
      const res = await apiFetch(`/api/applications/jobseeker/${jobSeekerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const json = await res.json();
      console.log("Applications Response:", json);

      if (res.status === 200 && json.data) {
        setApplications(json.data);
      } else {
        setError(json.message || "Failed to load applications");
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) {
      return;
    }

    try {
      setWithdrawingId(applicationId);
      const token = getToken();
      
      const res = await apiFetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const json = await res.json();
      console.log("Withdraw Response:", json);

      if (res.status === 200) {
        alert("✓ Application withdrawn successfully!");
        // Remove the application from the list
        setApplications(applications.filter(app => app.applicationId !== applicationId));
      } else {
        alert(json.message || "Failed to withdraw application");
      }
    } catch (err) {
      console.error("Error withdrawing application:", err);
      alert("Failed to withdraw application. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <div className="applications-container">
        <p className="loading">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-container">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h1>My Applications</h1>
        <p className="applications-count">
          {applications.length} application{applications.length !== 1 ? "s" : ""}
        </p>
      </div>

      {applications && applications.length > 0 ? (
        <div className="applications-grid">
          {applications.map((app) => (
            <div key={app.applicationId} className="application-card">
              <div className="card-header">
                <h3 className="job-title">{app.job?.title || "Job Title"}</h3>
                <span className={`status-badge status-${(app.status || "PENDING").toLowerCase()}`}>
                  {app.status || "PENDING"}
                </span>
              </div>

              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">Company:</span>
                  <span className="detail-value">{app.job?.companyName || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{app.job?.jobLocation || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Applied On:</span>
                  <span className="detail-value">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <a href={`/job/${app.job?.jobId}`} className="view-job-btn">
                  View Job Details
                </a>
                <button 
                  className="withdraw-btn" 
                  onClick={() => {
                    console.log("Withdraw clicked for app:", app.applicationId);
                    handleWithdrawApplication(app.applicationId);
                  }}
                  disabled={withdrawingId === app.applicationId}
                  style={{ display: 'block' }}
                >
                  {withdrawingId === app.applicationId ? "Withdrawing..." : "Withdraw"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-applications">
          <p>📋 You haven't applied to any jobs yet.</p>
          <p>Start exploring and apply to jobs that match your skills!</p>
          <a href="/jobs" className="explore-btn">Explore Jobs</a>
        </div>
      )}
    </div>
  );
}

export default JobSeekerApplications;