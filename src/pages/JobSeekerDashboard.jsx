import React, { useEffect, useState } from "react";
import "../App.css";
import { apiFetch, getToken } from "../api";
import { useReduxJobSeeker, useReduxUser } from "../hooks/useReduxUser";
import { useNavigate } from "react-router-dom";

export default function JobSeekerDashboard() {
  const navigate = useNavigate();
  const jobSeeker = useReduxJobSeeker();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const gotoJobDetailPage = () => navigate("/job-detail");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const url = `/api/jobs?searchText=${encodeURIComponent(searchText)}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

      const response = await apiFetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== "success" && response.status !== 200) {
        console.log(response.message || "Failed to fetch jobs");
        return;
      }

      const data = await response.json();
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
   
    try {
      setLoading(true);
      const token = getToken();
      const url = `/api/applications/jobseeker/${jobSeeker.jobSeekerId}`;

      const response = await apiFetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== "success" && response.status !== 200) {
        console.log(
          "---------------hshsjs------------",
          response.message || "Failed to fetch applications"
        );
        alert(response.message || "Failed to fetch applications");
        return;
      }

      if (response.status === 200) {
        const json = await response.json();
        console.log("applied jobs", JSON.stringify(json));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [pageNumber, pageSize]);

  const handleRowClick = (job) => {
    console.log("Selected Job:", job);
     localStorage.setItem("selectedJob", JSON.stringify(job));
    gotoJobDetailPage();
    
   
  };

  const handleSearchChange = (e) => setSearchText(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNumber(0); // Reset to first page on new search
    fetchJobs();
    fetchApplications();
  };

  const handleNextPage = () => setPageNumber((prev) => prev + 1);
  const handlePrevPage = () => setPageNumber((prev) => (prev >= 1 ? prev - 1 : 0));

  return (
    <div className="main-container">
      <h2>Job Listings</h2>

      {/* Search Box */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search jobs by title..."
          style={{
            padding: "8px",
            width: "250px",
            marginRight: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {/* Jobs Table */}
      <div className="section" style={{ marginTop: "10px" }}>
        <h3>Available Jobs</h3>
        {loading ? (
          <p>Loading jobs...</p>
        ) : (
          <>
            <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px" }}>Job ID</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Title</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Description</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Location</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(jobs) && jobs.length > 0 ? (
                  jobs.map((job) => (
                    <tr
                      key={job.jobId}
                      onClick={() => handleRowClick(job)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ padding: "8px" }}>{job.jobId}</td>
                      <td style={{ padding: "8px" }}>{job.title}</td>
                      <td style={{ padding: "8px" }}>{job.description}</td>
                      <td style={{ padding: "8px" }}>{job.jobLocation}</td>
                      <td style={{ padding: "8px" }}>{job.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "8px" }}>
                      No jobs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                onClick={handlePrevPage}
                hidden={pageNumber === 0}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
              >
                Previous
              </button>
              <span>Page {pageNumber + 1}</span>
              <button
                onClick={handleNextPage}
                hidden={
                  (pageNumber + 1) * pageSize >= total
                }
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}