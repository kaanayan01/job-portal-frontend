import React from "react";
import "../App.css";

function AdminReports() {
  return (
    <div className="main-container">
      <h2>Reports & Analytics</h2>
      <p className="section-subtitle">
        Frontend placeholder for future charts and reports from ReportController.
      </p>

      <div className="card-grid">
        <div className="card">
          <h3 className="card-title">Jobs per employer</h3>
          <p className="card-meta">
            Bar chart / table of how many jobs each employer has posted.
          </p>
        </div>
        <div className="card">
          <h3 className="card-title">Applications funnel</h3>
          <p className="card-meta">
            Applications → Shortlisted → Selected for all job posts.
          </p>
        </div>
        <div className="card">
          <h3 className="card-title">Revenue by plan</h3>
          <p className="card-meta">
            Split of revenue from different employer subscription plans.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;