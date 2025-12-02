
import React from "react";
import "../App.css";

const dummyJobs = [
  { title: "React Developer", status: "OPEN", applicants: 12 },
  { title: "Java Backend Engineer", status: "CLOSED", applicants: 9 },
];

function EmployerDashboard({ subscriptionPlan, setCurrentPage }) {
  const isPremium = subscriptionPlan === "PREMIUM";
  const goToAddJob = () => setCurrentPage("AddJob");
  return (
    <div className="main-container">
      <h2>Employer Dashboard</h2>

      {/* Add Job Button */}
      <div style={{ marginBottom: "20px" }}>
        <button
          className="primary-btn"
          onClick={() => goToAddJob()}
        >
          Add Job
        </button>
      </div>

      <div className="dashboard-layout">
        <div>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Active Jobs</div>
              <div className="metric-value">2</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Applicants</div>
              <div className="metric-value">21</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Plan</div>
              <div className="metric-value">
                {isPremium ? "Premium" : "Standard"}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="list-table">
              <div className="list-table-header">
                <span>Job Title</span>
                <span>Status</span>
                <span>Applicants</span>
              </div>
              {dummyJobs.map((j, idx) => (
                <div key={idx} className="list-table-row">
                  <span>{j.title}</span>
                  <span>{j.status}</span>
                  <span>{j.applicants}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 className="card-title">Daily job post limit</h3>
            <p className="card-meta">
              {isPremium
                ? "Premium employers can post more than 5 jobs per day."
                : "Standard employers can post up to 5 jobs per day."}
            </p>
            {!isPremium && (
              <div className="upgrade-banner" style={{ marginTop: 10 }}>
                <strong>Upgrade to Premium</strong> to remove daily posting
                limit and unlock advanced candidate recommendations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployerDashboard;
