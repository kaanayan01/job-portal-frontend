import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function JobSeekerApplications({ user }) {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await apiFetch(`/api/applications/jobseeker/${user.jobSeekerId}`);
    const json = await res.json();
    setApps(json.data);
  };

  return (
    <div className="main-container">
      <h2>Applications</h2>
      {apps.map(a => (
        <div key={a.applicationId}>
          <b>{a.job.title}</b> — Status: {a.status}
        </div>
      ))}
    </div>
  );
}

export default JobSeekerApplications;