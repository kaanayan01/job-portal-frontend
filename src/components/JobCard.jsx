import React from "react";
import "../App.css";

function JobCard({ job, onApply }) {
  return (
    <article className="card">
      <h3 className="card-title">{job.title}</h3>
      <p className="card-meta">
        {job.company} · {job.location}
      </p>
      <div className="card-tags">
        {job.skills.map((s) => (
          <span key={s} className="tag">
            {s}
          </span>
        ))}
      </div>
      <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
        {job.description}
      </p>

      <div className="card-footer">
        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
          ₹ {job.salaryRange}
        </span>
        <button className="btn btn-primary" onClick={() => onApply(job)}>
          Apply
        </button>
      </div>
    </article>
  );
}

export default JobCard;