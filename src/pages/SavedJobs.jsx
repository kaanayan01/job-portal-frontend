import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getToken, API_BASE_URL } from "../api";
import "../assets/styles/SavedJobs.css";

function SavedJobs() {
  const jobSeeker = useSelector(state => state.jobSeeker?.jobSeeker);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobSeeker?.jobSeekerId) {
      fetchSavedJobs();
    }
  }, [jobSeeker]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      console.log("Fetching saved jobs for jobSeekerId:", jobSeeker.jobSeekerId);
      
      const res = await fetch(`${API_BASE_URL}/api/saved-jobs/jobseeker/${jobSeeker.jobSeekerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        credentials: "include",
        mode: "cors"
      });
      const json = await res.json();
      
      console.log("Fetch saved jobs response:", json);
      console.log("Response status:", res.status);
      
      if (res.status === 200 && json.data) {
        const jobsArray = Array.isArray(json.data) ? json.data : [];
        console.log("Saved jobs array:", jobsArray);
        jobsArray.forEach((job, idx) => {
          console.log(`Job ${idx} full object:`, JSON.stringify(job));
          console.log(`  Fields available:`, Object.keys(job));
          console.log(`  id: ${job.id}, savedJobId: ${job.savedJobId}, saveId: ${job.saveId}, recordId: ${job.recordId}`);
        });
        setSavedJobs(jobsArray);
        console.log("Total saved jobs fetched:", jobsArray);
      } else {
        setError(json.message || "Failed to load saved jobs");
      }
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
      setError("Error loading saved jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavedJob = async (savedJobId) => {
    if (!window.confirm("Are you sure you want to remove this job from saved?")) {
      return;
    }

    try {
      setDeletingId(savedJobId);
      const token = getToken();
      
      console.log("Attempting to delete saved job with ID:", savedJobId);
      console.log("Using token:", token ? "YES" : "NO");
      console.log("  URL:", `${API_BASE_URL}/api/saved-jobs/${savedJobId}`);
      
      const res = await fetch(`${API_BASE_URL}/api/saved-jobs/${savedJobId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        credentials: "include",
        mode: "cors"
      });

      console.log("Delete response status:", res.status);
      
      // Handle both 200 and 204 No Content responses
      if (res.status === 200 || res.status === 204) {
        console.log("Job unsaved successfully, refreshing list...");
        setError(null);
        // Refresh the entire list
        await fetchSavedJobs();
      } else {
        // Try to parse error response
        let errorMessage = "Failed to remove saved job";
        try {
          const json = await res.json();
          console.log("Delete error response:", json);
          errorMessage = json.message || json.error || errorMessage;
        } catch (e) {
          console.log("Could not parse error response");
        }
        setError(`${errorMessage} (Status: ${res.status})`);
      }
    } catch (err) {
      console.error("Error deleting saved job:", err);
      setError(`Error removing saved job: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="saved-jobs-container">
        <h1>Saved Jobs</h1>
        <div className="loading">Loading saved jobs...</div>
      </div>
    );
  }

  return (
    <div className="saved-jobs-container">
      <h1>Saved Jobs</h1>
      
      {error && <div className="error-message">{error}</div>}

      {savedJobs.length === 0 ? (
        <div className="no-saved-jobs">
          <p>No saved jobs yet.</p>
          <p>Save jobs from the jobs listing to view them here.</p>
        </div>
      ) : (
        <div className="saved-jobs-list">
          <div className="jobs-count">{savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}</div>
          {savedJobs.map((saved) => {
            const job = saved.job || {};
            const savedJobId = saved.id || saved.savedJobId;
            
            return (
              <div key={savedJobId} className="saved-job-card">
                <div className="job-header">
                  <div className="job-info">
                    <h3>{job.title || "Job Title"}</h3>
                    <p className="company-name">{job.company?.companyName || job.companyName || "Company Name"}</p>
                    <p className="job-location">{job.location || "Location"}</p>
                  </div>
                </div>

                <div className="job-details">
                  {job.salary && (
                    <div className="detail-item">
                      <span className="label">Salary:</span>
                      <span className="value">₹{job.salary.toLocaleString()}</span>
                    </div>
                  )}
                  {job.experience && (
                    <div className="detail-item">
                      <span className="label">Experience:</span>
                      <span className="value">{job.experience}</span>
                    </div>
                  )}
                  {job.qualifications && (
                    <div className="detail-item">
                      <span className="label">Qualifications:</span>
                      <span className="value">{job.qualifications}</span>
                    </div>
                  )}
                </div>

                {job.description && (
                  <div className="job-description">
                    <p>{job.description.substring(0, 200)}...</p>
                  </div>
                )}

                <div className="job-actions">
                  <button
                    className="btn-unsave"
                    onClick={() => handleDeleteSavedJob(savedJobId)}
                    disabled={deletingId === savedJobId}
                  >
                    {deletingId === savedJobId ? "Removing..." : "✕ Remove from Saved"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SavedJobs;