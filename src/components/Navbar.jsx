// src/components/Navbar.jsx
import React from "react";

function Navbar({ currentPage, setCurrentPage, user, onLogout }) {
  const goHome = () => setCurrentPage("home");

  return (
    <header className="navbar">
      {/* Left: logo */}
      <div className="navbar-left" onClick={goHome} style={{ cursor: "pointer" }}>
        <span className="logo-highlight">Job</span>Portal
      </div>

      {/* Center: main links */}
      <nav className="navbar-center">
        <button
          className={`nav-link ${currentPage === "jobs" ? "active" : ""}`}
          onClick={() => setCurrentPage("jobs")}
        >
          Jobs
        </button>

        {user?.userType === "ADMIN" && (
          <button
            className="nav-link"
            onClick={goHome}
          >
            Admin Panel
          </button>
        )}
      </nav>

      {/* Right: login / register / logout */}
      <div className="navbar-right">
        {!user && (
          <>
            <button
              className={`btn btn-outline ${currentPage === "login" ? "active" : ""}`}
              onClick={() => setCurrentPage("login")}
            >
              Login
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setCurrentPage("register")}
            >
              Register
            </button>
          </>
        )}

        {user && (
          <button className="btn btn-danger" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;