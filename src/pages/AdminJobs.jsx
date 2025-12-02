import React from "react";
import "../App.css";

const DUMMY_JOBS = [
  { id: 1, title: "React Developer", employer: "TechNova Labs", status: "OPEN" },
  { id: 2, title: "Data Analyst", employer: "InsightWorks", status: "CLOSED" },
];

function AdminJobs() {
  return (
    <div className="main-container">
      <h2>All Jobs</h2>
      <p className="section-subtitle">
        Backend: Admin to view, approve or block job posts.
      </p>

      <div className="list-table">
        <div className="list-table-header">
          <span>Job Title</span>
          <span>Employer</span>
          <span>Status</span>
        </div>
        {DUMMY_JOBS.map((j) => (
          <div key={j.id} className="list-table-row">
            <span>{j.title}</span>
            <span>{j.employer}</span>
            <span>{j.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminJobs;