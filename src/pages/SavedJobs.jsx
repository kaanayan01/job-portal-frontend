import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function SavedJobs({ user }) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await apiFetch(`/api/saved-jobs/jobseeker/${user.jobSeekerId}`);
    const json = await res.json();
    setJobs(json.data);
  };

  const removeJob = async (id) => {
    await apiFetch(`/api/saved-jobs/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="main-container">
      <h2>Saved Jobs</h2>
      <ul>
        {jobs.map(j => (
          <li key={j.savedJobId}>
            {j.job.title}
            <button onClick={() => removeJob(j.savedJobId)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SavedJobs;