import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function JobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch("/api/jobs");
      const json = await res.json();
      setJobs(json.data);
    };
    load();
  }, []);

  return (
    <div className="main-container">
      <h2>Available Jobs</h2>
      <div className="card-grid">
        {jobs?.map(job => (
          <div className="card" key={job.jobId}>
            <h3>{job.title}</h3>
            <p>{job.jobLocation}</p>
            <p>{job.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobsPage;