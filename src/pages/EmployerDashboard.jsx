import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "../api";
import "../App.css";
import { useNavigate } from "react-router-dom";

function EmployerDashboard() {
  const navigate = useNavigate();
  const employer = useSelector(state => state.employer?.employer);
  const employerId = employer?.employerId || localStorage.getItem("employerId");
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    totalJobs: 0
  });

  const isPremium = employer?.subscriptionType === 'PREMIUM';
  
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
        
        // Calculate statistics
        const activeJobs = jobsList.filter(j => j.status === 'ACTIVE' || !j.status).length;
        const totalApplicants = jobsList.reduce((sum, job) => {
          return sum + (job.applicantCount || 0);
        }, 0);
        
        setStats({
          activeJobs,
          totalApplicants,
          totalJobs: jobsList.length
        });
        
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

  if (!employer && !employerId) {
    return <div className="main-container"><p>Error: Employer data not found.</p></div>;
  }
  
  const goToAddJob = () => navigate("/employer/create-job");
  const goToApplicants = (jobId) => navigate(`/employer/applicants/${jobId}`);
  
  return (
    <div className="main-container">
      <h2>Employer Dashboard</h2>

      {/* Add Job Button */}
      <div style={{ marginBottom: "20px" }}>
        <button
          className="primary-btn"
          onClick={goToAddJob}
        >
          + Add Job
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading your jobs...</p>
        </div>
      ) : (
        <div className="dashboard-layout">
          <div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Total Jobs Posted</div>
                <div className="metric-value">{stats.totalJobs}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Active Jobs</div>
                <div className="metric-value">{stats.activeJobs}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Total Applicants</div>
                <div className="metric-value">{stats.totalApplicants}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Plan</div>
                <div className="metric-value">
                  {isPremium ? "✨ Premium" : "Standard"}
                </div>
              </div>
            </div>

            <div className="section">
              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Your Posted Jobs</h3>
              {jobs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  color: '#999'
                }}>
                  <p>No jobs posted yet. <a href="#" onClick={goToAddJob}>Post your first job</a></p>
                </div>
              ) : (
                <div className="list-table">
                  <div className="list-table-header">
                    <span>Job Title</span>
                    <span>Location</span>
                    <span>Status</span>
                    <span>Applicants</span>
                    <span>Action</span>
                  </div>
                  {jobs.map((job) => (
                    <div key={job.jobId} className="list-table-row">
                      <span className="job-title">{job.title}</span>
                      <span>{job.jobLocation || "N/A"}</span>
                      <span>
                        <span className={`status-badge status-${(job.status || 'ACTIVE').toLowerCase()}`}>
                          {job.status || 'ACTIVE'}
                        </span>
                      </span>
                      <span>{job.applicantCount || 0}</span>
                      <span>
                        <button 
                          className="view-btn"
                          onClick={() => goToApplicants(job.jobId)}
                          title="View applicants"
                        >
                          View
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card">
              <h3 className="card-title">💼 Subscription Plan</h3>
              <p className="card-meta">
                {isPremium
                  ? "You have Premium access. Post unlimited jobs and unlock all features."
                  : "You are on the Standard plan. Post up to 5 jobs per day."}
              </p>
              {!isPremium && (
                <div className="upgrade-banner" style={{ marginTop: 10 }}>
                  <strong>Upgrade to Premium</strong> to post unlimited jobs and get advanced candidate recommendations.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerDashboard;
