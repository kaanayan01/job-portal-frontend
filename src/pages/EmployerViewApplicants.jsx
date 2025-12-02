import React from "react";
import "../App.css";

const DUMMY_APPLICANTS = [
  { id: 1, name: "Shruti Narang", jobTitle: "Frontend Developer", status: "Shortlisted" },
  { id: 2, name: "Aman Verma", jobTitle: "Backend Engineer", status: "Under review" },
];

function EmployerViewApplicants() {
  return (
    <div className="main-container">
      <h2>Applicants</h2>
      <p className="section-subtitle">
        This represents ApplicationController + JobPostController joined data.
      </p>

      <div className="list-table">
        <div className="list-table-header">
          <span>Candidate</span>
          <span>Job Title</span>
          <span>Status</span>
        </div>
        {DUMMY_APPLICANTS.map((a) => (
          <div key={a.id} className="list-table-row">
            <span>{a.name}</span>
            <span>{a.jobTitle}</span>
            <span>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployerViewApplicants;