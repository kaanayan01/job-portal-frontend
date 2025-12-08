import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./PremiumCheckRoute.css";

/**
 * PremiumCheckRoute component for preventing premium users from accessing payment
 * Shows message if user is already a premium customer
 */
export default function PremiumCheckRoute({ children }) {
  const navigate = useNavigate();
  const jobSeeker = useSelector((state) => state.jobSeeker?.jobSeeker);
  const employer = useSelector((state) => state.employer?.employer);

  // Check if user is already premium
  const isPremium = () => {
    if (jobSeeker && jobSeeker.subscriptionType === "PREMIUM") {
      return true;
    }
    if (employer && employer.subscriptionType === "PREMIUM") {
      return true;
    }
    return false;
  };

  // Redirect to dashboard if already premium
  useEffect(() => {
    if (isPremium()) {
      const timer = setTimeout(() => {
        if (jobSeeker) {
          navigate("/jobs");
        } else if (employer) {
          navigate("/employer/dashboard");
        } else {
          navigate("/");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate, jobSeeker, employer]);

  // If user is already premium, show message
  if (isPremium()) {
    return (
      <div className="premium-check-container">
        <div className="premium-message-card">
          <div className="premium-icon">✨</div>
          <h2>You're Already Premium!</h2>
          <p>Your account has already been upgraded to a premium subscription.</p>
          <div className="premium-details">
            <p className="detail-text">
              {jobSeeker && "You have access to all premium features as a job seeker."}
              {employer && "You have access to all premium features as an employer."}
            </p>
          </div>
          <div className="premium-actions">
            <button 
              className="btn-go-dashboard"
              onClick={() => {
                if (jobSeeker) {
                  navigate("/jobseeker/dashboard");
                } else if (employer) {
                  navigate("/employer/dashboard");
                } else {
                  navigate("/");
                }
              }}
            >
              Go to Dashboard
            </button>
          </div>
          <p className="redirect-info">Redirecting in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return children;
}
