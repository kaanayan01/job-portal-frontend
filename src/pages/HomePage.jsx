import React from "react";
import "../App.css";
import HomeImage from "../assets/homeImage.webp";
function HomePage({ onNavigate }) {
  return (
    <div className="main-container">
      <section className="hero py-5">
        <div className="container-lg">
          <div className="row align-items-center">
           {/*TEXT -LEFT on md+ */}
           <div className="col-md-6 order-2 order-md-1">
        <h1 className="hero-title display-5 fw-bold mb-3">      
           Welcome to Job Portal    
        </h1>
        <p className="hero-subtitle text-muted fs-5 mb-4">
          "   The future depends on what you do today.  "
        </p>
        <div className="hero-actions">
          <button
            className="btn btn-primary-lg me-2"
            onClick={() => onNavigate?.("/jobs")}
          >
            Browse Jobs
          </button>
          </div>
          </div>
         
          </div>
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