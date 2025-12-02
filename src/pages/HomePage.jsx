import React from "react";
import "../App.css";

function HomePage({ onNavigate }) {
  return (
    <div className="main-container">
      <section className="hero">
        <h1 className="hero-title">Welcome to Job Portal</h1>
        <p className="hero-subtitle">
          A smart job platform for job seekers, employers, and admins — designed
          for fast hiring, tailored matches, and a clean experience.
        </p>

        <div className="hero-actions">
          <button
            className="btn btn-primary"
            onClick={() => onNavigate("jobs")}
          >
            Browse Jobs
          </button>
          <button
            className="btn btn-outline"
            onClick={() => onNavigate("register")}
          >
            Get Started
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Why this portal?</h2>
          <p className="section-subtitle">
           
          </p>
        </div>

        <div className="card-grid">
          <div className="card">
            <h3 className="card-title">For Job Seekers</h3>
            <p className="card-meta">
              Create a profile, upload resume, save jobs
            </p>
            <div className="card-tags">
              <span className="tag">Smart profile</span>
              <span className="tag">Saved jobs</span>
              <span className="tag">Skill match</span>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">For Employers</h3>
            <p className="card-meta">
             Post jobs, view applicants and hire the best.
            </p>
            <div className="card-tags">
              <span className="tag">Job posts</span>
              <span className="tag">Applications</span>
              <span className="tag">Reports</span>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">For Admin</h3>
            <p className="card-meta">
              Monitor users, jobs, payments and subscriptions.
            </p>
            <div className="card-tags">
              <span className="tag">User control</span>
              <span className="tag">Payments</span>
              <span className="tag">Analytics</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;