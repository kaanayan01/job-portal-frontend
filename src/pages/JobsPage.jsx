import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useReduxUser } from "../hooks/useReduxUser";
import { apiFetch, getToken } from "../api";
import "./JobsPage.css";

function JobsPage() {
  const navigate = useNavigate();
  const reduxUser = useReduxUser();
  const jobSeeker = useSelector(state => state.jobSeeker?.jobSeeker);
  const employer = useSelector(state => state.employer?.employer);
  
  // Check if user is a job seeker based on userType from Redux user state
  // This is more reliable on page refresh than checking Redux jobSeeker state
  const isJobSeeker = reduxUser?.userType === 'JOB_SEEKER';
  const isAdmin = reduxUser?.userType === 'ADMIN';
  
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Map()); // Changed to Map to store status
  const [savedJobs, setSavedJobs] = useState(new Map()); // Map to store jobId -> savedJobId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [skillMatchResult, setSkillMatchResult] = useState(null);
  const [skillMatchLoading, setSkillMatchLoading] = useState(false);
  const [withdrawingJobId, setWithdrawingJobId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all", "applied", "saved"
  const [savingJobId, setSavingJobId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const itemsPerPage = 6;

  // Check if user is premium
  const isPremium = jobSeeker?.subscriptionType === 'PREMIUM';

  // Admin delete job function
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    setDeletingJobId(jobId);
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
      setDeletingJobId(null);
    }
  };

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
        // Remove from appliedJobs map
        const newAppliedJobs = new Map(appliedJobs);
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

  // Filter jobs based on search term and active tab
  const filteredJobs = useMemo(() => {
    let jobsToFilter = jobs;

    // Filter by tab
    if (activeTab === "applied") {
      jobsToFilter = jobs.filter(job => appliedJobs.has(job.jobId));
    } else if (activeTab === "saved") {
      console.log("Filtering for saved tab:");
      console.log("  savedJobs Map keys:", Array.from(savedJobs.keys()));
      console.log("  savedJobs Map size:", savedJobs.size);
      console.log("  jobs count:", jobs.length);
      if (jobs.length > 0) {
        console.log("  First job sample:", JSON.stringify(jobs[0]));
      }
      jobsToFilter = jobs.filter(job => {
        const isSaved = savedJobs.has(job.jobId);
        console.log(`    Checking job ${job.jobId} (${job.title}): ${isSaved ? 'SAVED' : 'NOT SAVED'}`);
        return isSaved;
      });
      console.log("  Filtered jobs count:", jobsToFilter.length);
    }

    // Filter by search term
    if (!searchTerm.trim()) return jobsToFilter;
    
    const term = searchTerm.toLowerCase();
    return jobsToFilter.filter(job =>
      (job.title && job.title.toLowerCase().includes(term)) ||
      (job.companyName && job.companyName.toLowerCase().includes(term)) ||
      (job.jobLocation && job.jobLocation.toLowerCase().includes(term)) ||
      (job.description && job.description.toLowerCase().includes(term))
    );
  }, [jobs, searchTerm, activeTab, appliedJobs, savedJobs]);

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
        const appliedJobMap = new Map();
        json.data.forEach(app => {
          const jobId = app.job?.jobId || app.jobId;
          const status = app.status || "PENDING";
          appliedJobMap.set(jobId, status);
        });
        setAppliedJobs(appliedJobMap);
        console.log("Applied Jobs Map:", appliedJobMap);
      } else if (res.status === 200 && json.data) {
        console.log("Response data is not an array:", json.data);
      }
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
    }
  };

  // Fetch saved jobs for current user
  const fetchSavedJobs = async () => {
    if (!jobSeeker?.jobSeekerId) {
      console.log("Job Seeker ID not available yet");
      return;
    }

    try {
      const token = getToken();
      const res = await apiFetch(`/api/saved-jobs/jobseeker/${jobSeeker.jobSeekerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const json = await res.json();
      console.log("Saved Jobs Response:", json);

      if (res.status === 200 && json.data && Array.isArray(json.data)) {
        const savedJobMap = new Map();
        json.data.forEach((saved, idx) => {
          console.log(`Saved Job ${idx}:`, JSON.stringify(saved));
          console.log(`  Fields available:`, Object.keys(saved));
          
          // Extract jobId from the response
          // The API returns an object with job details
          const jobId = saved.job?.jobId || saved.jobId;
          
          // Extract the saved record ID - this is the ID of the saved job record itself
          // Try multiple field names that might be used
          const recordId = saved.id || saved.savedJobId || saved.savedId || saved.saveId;
          
          console.log(`  -> extracted jobId: ${jobId} (type: ${typeof jobId}), recordId: ${recordId}`);
          
          if (jobId) {
            savedJobMap.set(jobId, recordId);
            console.log(`  -> Added to map: key=${jobId}, value=${recordId}`);
          }
        });
        setSavedJobs(savedJobMap);
        console.log("Final Saved Jobs Map:", Array.from(savedJobMap.entries()));
      }
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    }
  };

  // Save or unsave a job
  const handleToggleSaveJob = async (jobId) => {
    if (!jobSeeker?.jobSeekerId) {
      alert("Job seeker information not found. Please login first.");
      return;
    }

    try {
      setSavingJobId(jobId);
      const token = getToken();
      
      // Handle both Map and Set for backwards compatibility
      let savedJobId;
      let isSaved = false;
      
      if (savedJobs instanceof Map) {
        savedJobId = savedJobs.get(jobId);
        isSaved = savedJobId !== undefined;
      } else if (savedJobs instanceof Set) {
        isSaved = savedJobs.has(jobId);
        savedJobId = jobId; // For Set, use jobId directly
      }

      if (isSaved) {
        // Unsave: DELETE request using saved job record ID
        console.log(`Deleting saved job: jobId=${jobId}, savedId=${savedJobId}`);
        
        const res = await apiFetch(`/api/saved-jobs/${savedJobId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        console.log("Delete response status:", res.status);
        
        if (res.status === 200 || res.status === 204) {
          const newSavedJobs = new Map(savedJobs);
          newSavedJobs.delete(jobId);
          setSavedJobs(newSavedJobs);
          console.log("Job unsaved successfully");
        } else {
          const json = await res.json();
          console.error("Delete failed:", json);
          alert(json.message || "Failed to unsave job");
        }
      } else {
        // Save: POST request
        const postBody = {
          jobSeekerId: jobSeeker.jobSeekerId,
          jobId: jobId,
        };
        console.log("Attempting to save job with body:", postBody);
        
        const res = await apiFetch("/api/saved-jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(postBody),
        });

        const json = await res.json();
        console.log("Save job response status:", res.status);
        console.log("Save job response:", JSON.stringify(json));
        
        // Check if response indicates success (200, 201, or even if status field shows success)
        if (res.ok || res.status === 200 || res.status === 201 || json.status === 200) {
          console.log("Job saved successfully!");
          
          // Extract the actual saved job record ID from the response
          let savedId = null;
          if (json.data) {
            if (typeof json.data === 'object') {
              savedId = json.data.id || json.data.savedJobId || json.data.saveId;
            } else if (typeof json.data === 'number') {
              savedId = json.data;
            }
          }
          
          console.log("Extracted saved ID from response:", savedId);
          
          if (savedId) {
            // Store the actual saved record ID
            const newSavedJobs = new Map(savedJobs);
            newSavedJobs.set(jobId, savedId);
            setSavedJobs(newSavedJobs);
            console.log("Stored in Map: jobId =", jobId, "savedId =", savedId);
          } else {
            // If we couldn't extract the ID, refetch to get it
            console.log("Could not extract saved ID from response, refetching...");
            await fetchSavedJobs();
          }
          
        } else {
          console.error("Save job failed with status:", res.status, "Response:", json);
          alert(json.message || `Failed to save job (Status: ${res.status})`);
        }
      }
    } catch (err) {
      console.error("Error toggling save job:", err);
      alert("Failed to save/unsave job. Please try again.");
    } finally {
      setSavingJobId(null);
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
          if (jobsData.length > 0) {
            console.log("First job structure:", JSON.stringify(jobsData[0]));
            console.log("First job ID value:", jobsData[0].jobId, "Type:", typeof jobsData[0].jobId);
          }
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
      fetchSavedJobs();
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

      {/* Tabs - Only show for Job Seekers */}
      {isJobSeeker && (
        <div className="jobs-tabs">
          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
          >
            📋 All Jobs
          </button>
          <button
            className={`tab-btn ${activeTab === "applied" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("applied");
              setCurrentPage(1);
            }}
          >
            ✓ Applied ({appliedJobs.size})
          </button>
          <button
            className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("saved");
              setCurrentPage(1);
            }}
          >
            ★ Saved ({savedJobs.size})
          </button>
        </div>
      )}

      {/* Admin Section Info */}
      {isAdmin && (
        <div style={{
          background: "#e3f2fd",
          border: "1px solid #90caf9",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          color: "#1565c0"
        }}>
          <strong>Admin View:</strong> Viewing all jobs on the platform. You can delete jobs by clicking the delete button.
        </div>
      )}

      {/* Job Seeker Profile Warning */}
      {isJobSeeker && !jobSeeker?.jobSeekerId && (
        <div style={{
          background: "#fff3cd",
          border: "2px solid #ffc107",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
          color: "#856404"
        }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#856404" }}>⚠️ Complete Your Profile</h3>
          <p style={{ margin: "0 0 12px 0", fontSize: "0.95rem" }}>
            You need to complete your profile before you can apply for jobs. This helps employers understand your skills and experience.
          </p>
          <button
            onClick={() => navigate("/jobseeker/profile")}
            style={{
              background: "#ffc107",
              color: "#333",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#e0a800";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#ffc107";
            }}
          >
            → Go to Profile
          </button>
        </div>
      )}

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
              const applicationStatus = appliedJobs.get(job.jobId);
              const isApplied = applicationStatus !== undefined;
              if (isApplied) {
                console.log(`Job ${job.jobId} (${job.title}) status:`, applicationStatus);
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

                {/* Applied Badge with Status and Withdraw */}
                {isApplied && (
                  <div className="applied-badge-container">
                    <div className={`applied-badge status-${applicationStatus?.toLowerCase() || 'pending'}`}>
                      <span className="badge-icon">✓</span>
                      <span className="badge-text">{applicationStatus || "PENDING"}</span>
                    </div>
                    <button
                      className="withdraw-badge-btn"
                      onClick={() => handleWithdrawApplication(job.jobId)}
                      disabled={withdrawingJobId === job.jobId || (applicationStatus && applicationStatus !== "APPLIED")}
                      title={applicationStatus && applicationStatus !== "APPLIED" ? "Can only withdraw applications with APPLIED status" : "Withdraw your application"}
                    >
                      {withdrawingJobId === job.jobId ? "..." : (applicationStatus && applicationStatus !== "APPLIED") ? "✗" : "✕"}
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
                  ) : isJobSeeker ? (
                    <>
                      {!jobSeeker?.jobSeekerId ? (
                        <button
                          className="apply-btn inactive"
                          disabled
                          title="Complete your profile first to apply for jobs"
                          onClick={() => navigate("/jobseeker/profile")}
                          style={{ opacity: 0.6, cursor: "not-allowed" }}
                        >
                          📋 Complete Profile First
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
                    </>
                  ) : isAdmin ? (
                    <button
                      className="apply-btn"
                      onClick={() => {
                        localStorage.setItem("selectedJob", JSON.stringify(job));
                        navigate(`/job/${job.jobId}`);
                      }}
                    >
                      View Details
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

                  {/* Save button - only for job seekers */}
                  {isJobSeeker && (
                    <button
                      className={`save-job-btn ${savedJobs.has(job.jobId) ? "saved" : ""}`}
                      onClick={() => {
                        if (!jobSeeker?.jobSeekerId) {
                          navigate("/jobseeker/profile");
                          return;
                        }
                        handleToggleSaveJob(job.jobId);
                      }}
                      disabled={savingJobId === job.jobId || !jobSeeker?.jobSeekerId}
                      title={!jobSeeker?.jobSeekerId ? "Complete your profile first" : (savedJobs.has(job.jobId) ? "Remove from saved jobs" : "Save this job")}
                    >
                      {savingJobId === job.jobId ? "..." : savedJobs.has(job.jobId) ? "★ Saved" : "☆ Save"}
                    </button>
                  )}

                  {isJobSeeker && isPremium && job.status?.toUpperCase() !== 'INACTIVE' && (
                    <button
                      className="skill-match-btn"
                      onClick={() => handleSkillMatch(job.jobId)}
                      disabled={skillMatchLoading}
                    >
                      {skillMatchLoading ? "Checking..." : "⭐ Skill Match"}
                    </button>
                  )}

                  {/* Delete button - only for admins */}
                  {isAdmin && (
                    <button
                      className="apply-btn"
                      style={{
                        background: deletingJobId === job.jobId ? "#999" : "#dc3545",
                        cursor: deletingJobId === job.jobId ? "not-allowed" : "pointer",
                        marginLeft: "8px"
                      }}
                      onClick={() => handleDeleteJob(job.jobId)}
                      disabled={deletingJobId === job.jobId}
                      title="Delete this job"
                    >
                      {deletingJobId === job.jobId ? "Deleting..." : "🗑️ Delete"}
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