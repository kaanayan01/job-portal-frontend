import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./EmployerCreateJob.css";

function EmployerCreateJob({ setCurrentPage }) {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => { console.log("useSelector - Full Redux state:", state);
    return state.employer.employer;}
   );
   console.log("EmployerCreateJob - reduxUser:", reduxUser);
  const employerId = reduxUser?.employerId  || localStorage.getItem("employerId");
  if (!employerId) {
    console.warn("EmployerCreateJob - No employerId found in Redux or localStorage");
  }
  
  const [job, setJob] = useState({
    title: "",
    jobLocation: "",
    description: "",
    requirements: "",
    salary: "",
    jobType: "FULL_TIME",
    status: "ACTIVE",
    employerId: employerId || 0
  });
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const [jobCountLoading, setJobCountLoading] = useState(true);
  const isPremium = reduxUser?.subscriptionType === 'PREMIUM';
  const jobLimit = isPremium ? Infinity : 5;
  const canPostMore = jobCount < jobLimit;
  
  useEffect(() => {
    if (!employerId) {
      setError("Error: Employer ID not found. Please complete your profile first.");
    } else {
      // Fetch the count of jobs posted by this employer
      fetchJobCount();
    }
  }, [employerId]);

  const fetchJobCount = async () => {
    try {
      setJobCountLoading(true);
      const res = await apiFetch(`/api/jobs/employer/${employerId}`);
      
      if (res.status === 200) {
        const json = await res.json();
        // Count active jobs
        const activeJobs = Array.isArray(json.data) ? json.data.filter(j => j.status === 'ACTIVE' || !j.status) : [];
        setJobCount(activeJobs.length);
        console.log(`Employer ${employerId} has ${activeJobs.length} active jobs. Premium: ${isPremium}`);
      } else {
        console.error("Failed to fetch job count");
        setJobCount(0);
      }
    } catch (err) {
      console.error("Error fetching job count:", err);
      setJobCount(0);
    } finally {
      setJobCountLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!employerId) {
      setError("Cannot create job: Employer ID is missing.");
      return;
    }

    if (!job.title || !job.jobLocation || !job.description) {
      setError("Please fill in all required fields.");
      return;
    }

    // Check job limit for non-premium employers
    if (!isPremium && jobCount >= 5) {
      setError("You have reached the maximum limit of 5 job postings. Please upgrade to Premium to post more jobs.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const jobData = {
        ...job,
        employerId: Number(employerId),
        requirements: job.requirements ? job.requirements.split(",").map(r => r.trim()).filter(r => r) : [],
        postedDate: new Date().toISOString()
      };

      const res = await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify(jobData)
      });

      if (res.status === 200 || res.status === 201) {
        setMessage("Job Created Successfully!");
        setJob({ 
          title: "", 
          jobLocation: "", 
          description: "", 
          requirements: "",
          salary: "",
          jobType: "FULL_TIME",
          status: "ACTIVE",
          employerId 
        });
        // Refresh job count
        setJobCount(jobCount + 1);
        setTimeout(() => {
          if (setCurrentPage) {
            setCurrentPage("empDashboard");
          } else {
            navigate("/employer/dashboard");
          }
        }, 2000);
      } else {
        const json = await res.json();
        setError(json.message || "Failed to create job");
      }
    } catch (err) {
      console.error("Error creating job:", err);
      setError("Error creating job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-create-container">
      <div className="job-create-card">
        <div className="job-create-header">
          <h1>Post a New Job</h1>
          <p>Fill in the details to create a new job listing</p>
        </div>

        {/* Job Limit Info */}
        {!jobCountLoading && !isPremium && (
          <div className="job-limit-info">
            <p>📊 Jobs Posted: <strong>{jobCount}/5</strong></p>
            {!canPostMore && (
              <p className="limit-warning">You have reached your job posting limit. <a href="/employer/upgrade">Upgrade to Premium</a> to post more jobs.</p>
            )}
          </div>
        )}
        
        {isPremium && (
          <div className="premium-badge">
            ✨ Premium Employer - Unlimited Job Postings
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>✕</span> {error}
          </div>
        )}
        
        {message && (
          <div className="alert alert-success">
            <span>✓</span> {message}
          </div>
        )}
      
        <form onSubmit={submit} className="job-create-form">
          {/* Job Title */}
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input 
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Senior Java Developer"
              value={job.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Job Location */}
          <div className="form-group">
            <label htmlFor="jobLocation">Job Location *</label>
            <input 
              id="jobLocation"
              name="jobLocation"
              type="text"
              placeholder="e.g., Bangalore, Remote, New York"
              value={job.jobLocation}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Salary Range */}
          <div className="form-group">
            <label htmlFor="salary">Salary Range</label>
            <input 
              id="salary"
              name="salary"
              type="text"
              placeholder="e.g., 80000-120000 or 80k-120k"
              value={job.salary}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Job Type */}
          <div className="form-group">
            <label htmlFor="jobType">Job Type *</label>
            <select 
              id="jobType"
              name="jobType"
              value={job.jobType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select 
              id="status"
              name="status"
              value={job.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DELETED">Deleted</option>
            </select>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label htmlFor="description">Job Description *</label>
            <textarea 
              id="description"
              name="description"
              placeholder="Describe the job role, responsibilities, and what you're looking for..."
              value={job.description}
              onChange={handleChange}
              required
              className="form-textarea"
              rows={6}
            />
          </div>

          {/* Requirements */}
          <div className="form-group full-width">
            <label htmlFor="requirements">Requirements</label>
            <textarea 
              id="requirements"
              name="requirements"
              placeholder="List required skills and qualifications (comma-separated or one per line)&#10;e.g., Java, Spring Boot, SQL, 5+ years experience"
              value={job.requirements}
              onChange={handleChange}
              className="form-textarea"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={!employerId || loading || !canPostMore || jobCountLoading}
              className="submit-btn"
              title={!canPostMore ? "You have reached the maximum of 5 jobs. Upgrade to Premium for unlimited postings." : ""}
            >
              {loading ? "Creating Job..." : !canPostMore ? "Job Limit Reached (5/5)" : "Create Job Listing"}
            </button>
            <button 
              type="button"
              onClick={() => {
                if (setCurrentPage) {
                  setCurrentPage("empDashboard");
                } else {
                  navigate("/employer/dashboard");
                }
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployerCreateJob;