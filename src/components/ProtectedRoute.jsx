import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./ProtectedRoute.css";

/**
 * ProtectedRoute component for role-based access control
 * Prevents job seekers from accessing employer routes and vice versa
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate();
  const jobSeeker = useSelector((state) => state.jobSeeker?.jobSeeker);
  const employer = useSelector((state) => state.employer?.employer);
  const user = useSelector((state) => state.user?.user);

  // Check if user has the required role
  const hasAccess = () => {
    console.log("Checking access for role:", requiredRole, "User type:", user?.userType);
    
    if (!user || !user.userType) {
      return false;
    }
    
    // Support both single role and array of roles
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Normalize user type to lowercase for comparison
    const userType = user.userType.toLowerCase();
    
    return requiredRoles.some(role => {
      const normalizedRole = role.toLowerCase();
      
      // Check if user type matches the required role
      if (normalizedRole === "jobseeker" || normalizedRole === "job_seeker") {
        return userType === "job_seeker" || userType === "jobseeker";
      }
      if (normalizedRole === "employer") {
        return userType === "employer";
      }
      if (normalizedRole === "admin") {
        return userType === "admin";
      }
      return false;
    });
  };

  // Check if user is logged in at all
  const isLoggedIn = () => {
    return user && user.userId;
  };

  // Redirect to home if user doesn't have access
  useEffect(() => {
    if (!hasAccess() && isLoggedIn()) {
      // User is logged in but doesn't have permission - wait a moment before redirect
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate, requiredRole, jobSeeker, employer, user]);

  // If user doesn't have access
  if (!hasAccess()) {
    // User is logged in but trying to access wrong route type
    if (isLoggedIn()) {
      return (
        <div className="unauthorized-container">
          <div className="unauthorized-card">
            <div className="unauthorized-icon">🔒</div>
            <h2>Unauthorized Access</h2>
            <p>You don't have permission to access this page.</p>
            <div className="unauthorized-details">
              <p className="info-text">Your account type doesn't match the required access level for this route.</p>
            </div>
            <div className="unauthorized-actions">
              <button 
                className="btn-back-home"
                onClick={() => navigate("/")}
              >
                Go Back to Home
              </button>
            </div>
            <p className="redirect-info">Redirecting in 3 seconds...</p>
          </div>
        </div>
      );
    }
    
    // User is not logged in
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-card">
          <div className="unauthorized-icon">🔐</div>
          <h2>Authentication Required</h2>
          <p>Please log in to access this page.</p>
          <div className="unauthorized-actions">
            <button 
              className="btn-back-home"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
