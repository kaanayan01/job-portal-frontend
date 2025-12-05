
import React, { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch, getToken } from "../api";
import "./JobDetailPage.css";
import { useReduxUser } from "../hooks/useReduxUser";
function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useReduxUser();

  console.log("JobDetailPage - jobId param:", job);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const token = getToken();
        
        // Fetch job details
        const jobRes = await apiFetch(`/api/jobs/${jobId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (jobRes.status === 200) {
          const jobJson = await jobRes.json();
          const jobData = jobJson.data || jobJson;
          setJob(jobData);

          // Fetch employer details if we have employerId
          if (jobData.employerId) {
            try {
              const empRes = await apiFetch(`/api/company-profiles/employer/${jobData.employerId}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              if (empRes.status === 200) {
                const empJson = await empRes.json();
               
                setEmployer(empJson.data[0]);
              }
            } catch (err) {
              console.error("Error fetching employer details:", err);
            }
          }
        } else {
          setError("Failed to load job details");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

   
  if (loading) {
    return <div className="job-detail-container"><p className="loading">Loading job details...</p></div>;
  }

  if (error) {
    return <div className="job-detail-container"><p className="error">{error}</p></div>;
  }

  if (!job) {
    return <div className="job-detail-container"><p>Job not found</p></div>;
  }

  return (
    <div className="job-detail-container">
      <button className="back-btn" onClick={() => navigate("/jobs")}>
        ← Back to Jobs
      </button>

      <div className="job-detail-header">
        <h1>{job.title}</h1>
        <div className="job-detail-meta">
          <span className="job-type">{job.jobType || "Full-time"}</span>
          <span className="job-salary">💰 {job.salary ? `$${job.salary}` : "Negotiable"}</span>
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-info-section">
          <h3>Job Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Company:</strong>
              <p>{job.companyName || employer?.companyName || "N/A"}</p>
            </div>
            <div className="info-item">
              <strong>Location:</strong>
              <p>{job.jobLocation || "Remote"}</p>
            </div>
            <div className="info-item">
              <strong>Experience Level:</strong>
              <p>{job.experienceLevel || "Entry Level"}</p>
            </div>
            <div className="info-item">
              <strong>Posted Date:</strong>
              <p>{new Date(job.postedDate || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="job-description-section">
          <h3>Description</h3>
          <p>{job.description}</p>
        </div>

   {job.requirements && job.requirements.length > 0 && (
  <div className="job-requirements-section">
    <h3>Requirements</h3>
    <ul>
      {job.requirements.map((req, index) => (
        <li key={index}>{req}</li>
      ))}
    </ul>
  </div>
)}

        {employer && (
          <div className="employer-info-section">
            <h3>About the Company</h3>
            <div className="employer-details">
              <div className="employer-item">
                <strong>Company Name:</strong>
                <p>{employer.companyName}</p>
              </div>
              <div className="employer-item">
                <strong>Industry:</strong>
                <p>{employer.industry}</p>
              </div>
              <div className="employer-item">
                <strong>Address:</strong>
                <p>{employer.address}</p>
              </div>
              {employer.website && (
                <div className="employer-item">
                  <strong>Website:</strong>
                  <p>
                    <a href={employer.website} target="_blank" rel="noopener noreferrer">
                      {employer.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {user?.userType === "JOB_SEEKER" && <div className="job-detail-actions">
        <button className="apply-btn" onClick={() => navigate(`/apply/${job.jobId}`, { state: { job } })}>
          Apply Now
        </button>
      </div> }
    </div>
  );
}

export default JobDetailPage;