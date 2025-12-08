import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function JobCard() {
  const navigate = useNavigate();

  const handleApply = () => {
    navigate(`/apply`);
  };

  return (
    <article className="card">
      <h3 className="card-title">Job Title</h3>
      <p className="card-meta">Company · Location</p>
      <div className="card-tags">
        <span className="tag">Skill</span>
      </div>
      <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
        Job Description
      </p>
      <div className="card-footer">
        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
          ₹ Salary Range
        </span>
        <button className="btn btn-primary" onClick={handleApply}>
          Apply
        </button>
      </div>
    </article>
  );
}

export default JobCard;