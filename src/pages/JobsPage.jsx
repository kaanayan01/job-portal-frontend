import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiFetch, getToken } from "../api";
import "./JobsPage.css";

function JobsPage() {
  const navigate = useNavigate();
  const jobSeeker = useSelector(state => state.jobSeeker?.jobSeeker);
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [skillMatchResult, setSkillMatchResult] = useState(null);
  const [skillMatchLoading, setSkillMatchLoading] = useState(false);
  const [withdrawingJobId, setWithdrawingJobId] = useState(null);
  const itemsPerPage = 6;

  // Check if user is premium
  const isPremium = jobSeeker?.subscriptionType === 'PREMIUM';

  // Handle skill match button click
  const handleSkillMatch = async (jobId) => {
    if (!jobSeeker || !jobSeeker.jobSeekerId) {
      alert("Job seeker information not found. Please login again.");
      return;
    }

    try {
      setSkillMatchLoading(true);
      const token = getToken();
      
      const response = await fetch("http://localhost:9192/api/skill-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          jobSeekerId: jobSeeker.jobSeekerId,
          jobId: jobId
        })
      });

      const data = await response.json();
      console.log("Skill Match API Response:", data);

      if (data.status === 200) {
        // Extract percentage from response data - keep as is from backend
        const matchPercentage = data.data?.matchPercentage !== undefined 
          ? data.data.matchPercentage 
          : 0;

        // Get matched and missing skills from response, or use defaults
        let matchedSkills = data.data?.matchedSkills || [];
        let missingSkills = data.data?.missingSkills || [];

        // If backend returns skill data, use it; otherwise show percentage info
        const resultData = {
          matchPercentage: matchPercentage,
          matchedSkills: matchedSkills,
          missingSkills: missingSkills,
          recommendation: data.data?.recommendation || `Your skills match ${matchPercentage}% of the job requirements.`,
          hasDetailedSkills: matchedSkills.length > 0 || missingSkills.length > 0
        };

        console.log("Processed Skill Match Result:", resultData);
        setSkillMatchResult(resultData);
      } else {
        throw new Error(data.message || `Failed with status: ${data.status}`);
      }
    } catch (err) {
      console.error("Error checking skill match:", err);
      alert(`Failed to check skill match: ${err.message}`);
    } finally {
      setSkillMatchLoading(false);
    }
  };

  // Close skill match modal
  const closeSkillMatchModal = () => {
    setSkillMatchResult(null);
  };

  // Handle withdraw application
  const handleWithdrawApplication = async (jobId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) {
      return;
    }

    try {
      setWithdrawingJobId(jobId);
      const token = getToken();
      
      // Find the application ID by getting all applications and finding the matching one
      const appRes = await apiFetch(`/api/applications/jobseeker/${jobSeeker.jobSeekerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const appJson = await appRes.json();
      const application = appJson.data.find(app => 
        app.job?.jobId === jobId || app.jobId === jobId
      );

      if (!application) {
        alert("Application not found");
        setWithdrawingJobId(null);
        return;
      }

      // Delete the application
      const res = await apiFetch(`/api/applications/${application.applicationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const json = await res.json();

      if (res.status === 200) {
        alert("✓ Application withdrawn successfully!");
        // Remove from appliedJobs set
        const newAppliedJobs = new Set(appliedJobs);
        newAppliedJobs.delete(jobId);
        setAppliedJobs(newAppliedJobs);
      } else {
        alert(json.message || "Failed to withdraw application");
      }
    } catch (err) {
      console.error("Error withdrawing application:", err);
      alert("Failed to withdraw application. Please try again.");
    } finally {
      setWithdrawingJobId(null);
    }
  };

  // Filter jobs based on search term
  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs;
    
    const term = searchTerm.toLowerCase();
    return jobs.filter(job =>
      (job.title && job.title.toLowerCase().includes(term)) ||
      (job.companyName && job.companyName.toLowerCase().includes(term)) ||
      (job.jobLocation && job.jobLocation.toLowerCase().includes(term)) ||
      (job.description && job.description.toLowerCase().includes(term))
    );
  }, [jobs, searchTerm]);

  // Paginate filtered jobs
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Fetch applied jobs for current user
  const fetchAppliedJobs = async () => {
    if (!jobSeeker?.jobSeekerId) {
      console.log("Job Seeker ID not available yet");
      return;
    }

    try {
      const token = getToken();
      const res = await apiFetch(`/api/applications/jobseeker/${jobSeeker.jobSeekerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const json = await res.json();
      console.log("Applied Jobs Response:", json);

      if (res.status === 200 && json.data && Array.isArray(json.data)) {
        const appliedJobIds = new Set(json.data.map(app => app.job?.jobId || app.jobId));
        setAppliedJobs(appliedJobIds);
        console.log("Applied Job IDs Set:", Array.from(appliedJobIds));
      } else if (res.status === 200 && json.data) {
        console.log("Response data is not an array:", json.data);
      }
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiFetch("/api/jobs");
        
        console.log("API Response HTTP status:", res.status);
        
        if (res.status === 200 || res.ok) {
          const json = await res.json();
          console.log("API JSON Response:", json);
          
          // Handle different response formats
          let jobsData = [];
          
          if (json.data && Array.isArray(json.data)) {
            jobsData = json.data;
          } else if (json.data && Array.isArray(json.data.jobPosts)) {
            jobsData = json.data.jobPosts;
          } else if (Array.isArray(json)) {
            jobsData = json;
          }
          
          console.log("Extracted jobs:", jobsData, "Count:", jobsData.length);
          setJobs(jobsData);
          // Applied jobs will be fetched by separate useEffect
        } else {
          const json = await res.json();
          setError(json.message || "Failed to load jobs");
        }
      } catch (err) {
        console.error("Error loading jobs:", err);
        setError("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  // Fetch applied jobs when jobSeeker becomes available or when jobs change
  useEffect(() => {
    if (jobs.length > 0 && jobSeeker?.jobSeekerId) {
      fetchAppliedJobs();
    }
  }, [jobSeeker?.jobSeekerId, jobs.length]);

  if (loading) {
    return <div className="jobs-container"><p className="loading">Loading jobs...</p></div>;
  }

  if (error) {
    return <div className="jobs-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Available Jobs</h1>
        <p className="jobs-count">{filteredJobs.length} positions found</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm("")}>
            ✕ Clear
          </button>
        )}
      </div>

      {paginatedJobs && paginatedJobs.length > 0 ? (
        <>
          <div className="jobs-grid">
            {paginatedJobs.map(job => {
              const isApplied = appliedJobs.has(job.jobId);
              if (isApplied) {
                console.log(`Job ${job.jobId} (${job.title}) is applied:`, isApplied);
              }
              return (
              <div className="job-card" key={job.jobId}>
                <div className="job-card-header">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="header-right">
                    <span className={`job-status ${job.status?.toLowerCase() || 'active'}`}>
                      {job.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                    <span className="job-type">{job.jobType || "Full-time"}</span>
                  </div>
                </div>

                {/* Applied Badge with Withdraw */}
                {isApplied && (
                  <div className="applied-badge-container">
                    <div className="applied-badge">
                      <span className="badge-icon">✓</span>
                      <span className="badge-text">Applied</span>
                    </div>
                    <button
                      className="withdraw-badge-btn"
                      onClick={() => handleWithdrawApplication(job.jobId)}
                      disabled={withdrawingJobId === job.jobId}
                      title="Withdraw your application"
                    >
                      {withdrawingJobId === job.jobId ? "..." : "✕"}
                    </button>
                  </div>
                )}

                <div className="job-details">
                 
                  <p className="job-location">
                    <strong>📍 Location:</strong> {job.jobLocation || "Remote"}
                  </p>
                  <p className="job-salary">
                    <strong>💰 Salary:</strong> {job.salary ? `$${job.salary}` : "Negotiable"}
                  </p>
                </div>

                <div className="job-description">
                  <p>{job.description && job.description.substring(0, 150)}...</p>
                </div>

                <div className="job-meta">
                 
                  <span className="job-posted">
                    Posted: {new Date(job.postedDate || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="job-actions">
                  {job.status?.toUpperCase() === 'INACTIVE' ? (
                    <button className="apply-btn inactive" disabled title="This job posting is no longer active">
                      ❌ Position Closed
                    </button>
                  ) : (
                    <button
                      className="apply-btn"
                      onClick={() => {
                        localStorage.setItem("selectedJob", JSON.stringify(job));
                        navigate(`/job/${job.jobId}`);
                      }}
                    >
                      View Details
                    </button>
                  )}

                  {isPremium && job.status?.toUpperCase() !== 'INACTIVE' && (
                    <button
                      className="skill-match-btn"
                      onClick={() => handleSkillMatch(job.jobId)}
                      disabled={skillMatchLoading}
                    >
                      {skillMatchLoading ? "Checking..." : "⭐ Skill Match"}
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn prev"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="pagination-info">
                Page <span className="current-page">{currentPage}</span> of{" "}
                <span className="total-pages">{totalPages}</span>
              </div>

              <button
                className="pagination-btn next"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : searchTerm ? (
        <p className="no-jobs">No jobs found matching "{searchTerm}". Try a different search.</p>
      ) : (
        <p className="no-jobs">No jobs available at the moment.</p>
      )}

      {/* Skill Match Result Modal */}
      {skillMatchResult && (
        <div className="skill-match-modal-overlay" onClick={closeSkillMatchModal}>
          <div className="skill-match-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⭐ Skill Match Result</h2>
              <button className="close-btn" onClick={closeSkillMatchModal}>✕</button>
            </div>

            <div className="modal-body">
              {skillMatchResult.matchPercentage !== undefined ? (
                <>
                  <div className="match-percentage">
                    <div className="percentage-circle">
                      <span className="percentage-text">{skillMatchResult.matchPercentage}%</span>
                    </div>
                  </div>

                  {skillMatchResult.hasDetailedSkills ? (
                    <div className="match-details">
                      <h3>Matched Skills:</h3>
                      {skillMatchResult.matchedSkills && skillMatchResult.matchedSkills.length > 0 ? (
                        <div className="skills-list">
                          {skillMatchResult.matchedSkills.map((skill, index) => (
                            <span key={index} className="skill-badge matched">✓ {skill}</span>
                          ))}
                        </div>
                      ) : (
                        <p>No matched skills.</p>
                      )}

                      <h3 style={{ marginTop: "20px" }}>Missing Skills:</h3>
                      {skillMatchResult.missingSkills && skillMatchResult.missingSkills.length > 0 ? (
                        <div className="skills-list">
                          {skillMatchResult.missingSkills.map((skill, index) => (
                            <span key={index} className="skill-badge missing">✗ {skill}</span>
                          ))}
                        </div>
                      ) : (
                        <p>You have all the required skills!</p>
                      )}
                    </div>
                  ) : (
                    <div className="match-summary">
                      <p className="summary-text">
                        {skillMatchResult.matchPercentage === 100
                          ? "✓ Excellent! Your skills perfectly match this job."
                          : skillMatchResult.matchPercentage >= 75
                          ? "✓ Great match! Your skills are well aligned with this job."
                          : skillMatchResult.matchPercentage >= 50
                          ? "⚠ Good match! You have many relevant skills, but some are missing."
                          : skillMatchResult.matchPercentage > 0
                          ? "⚠ Moderate match. Consider upskilling in the missing areas."
                          : "✗ Low match. You may need to develop several skills for this role."}
                      </p>
                    </div>
                  )}

                  {skillMatchResult.recommendation && (
                    <div className="recommendation">
                      <h3>Recommendation:</h3>
                      <p>{skillMatchResult.recommendation}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="match-details">
                  <p>{JSON.stringify(skillMatchResult, null, 2)}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeSkillMatchModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobsPage;