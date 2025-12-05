import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import "./JobsPage.css";

function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
            {paginatedJobs.map(job => (
              <div className="job-card" key={job.jobId}>
                <div className="job-card-header">
                  <h3 className="job-title">{job.title}</h3>
                  <span className="job-type">{job.jobType || "Full-time"}</span>
                </div>

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
                <button
                className="apply-btn"
                onClick={() => {
                  localStorage.setItem("selectedJob", JSON.stringify(job));
                  navigate(`/job/${job.jobId}`);
                }}
                >
                View Details
                </button>
              </div>
            ))}
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
    </div>
  );
}

export default JobsPage;