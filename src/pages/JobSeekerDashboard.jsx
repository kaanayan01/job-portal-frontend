
import React, { useEffect, useState } from "react";
import "../App.css";
import { apiFetch, getToken } from "../api";

export default function JobSeekerDashboard({ user,setCurrentPage, setCurrentJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const gotoJobDetailPage = () => setCurrentPage("jobDetail");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await apiFetch(`/api/jobs`, {
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

      if (response.status === 200) {
        const json = await response.json();
        setJobs(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRowClick = (job) => {
    gotoJobDetailPage();
    setCurrentJob(job);
  };

  return (
    <div className="main-container">
      <h2>Job Listings</h2>

      {/* Jobs Table */}
      <div className="section" style={{ marginTop: "30px" }}>
        <h3>Available Jobs</h3>
        {loading ? (
          <p>Loading jobs...</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

