import React from "react";
import "../App.css";

const DUMMY_JOBS = [
  { id: 1, title: "Frontend Developer", status: "OPEN", applicants: 12 },
  { id: 2, title: "Backend Engineer", status: "CLOSED", applicants: 9 },
];

function EmployerJobList() {
  return (
    <div className="main-container">
      <h2>My Job Posts</h2>
      <p className="section-subtitle">
        Backend will populate from JobPost table filtered by employer.
      </p>

      <div className="list-table">
        <div className="list-table-header">
          <span>Job Title</span>
          <span>Status</span>
          <span>Applicants</span>
        </div>
        {DUMMY_JOBS.map((job) => (
          <div key={job.id} className="list-table-row">
            <span>{job.title}</span>
            <span>{job.status}</span>
            <span>{job.applicants}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployerJobList;