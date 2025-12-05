// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { apiFetch, setToken as saveTokenToLocal } from "../api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser as setUserAction, setToken as setTokenAction } from "../store/userSlice";
import { setJobSeeker as setJobSeekerAction } from "../store/jobSeekerSlice";
import { setEmployer as setEmployerAction } from "../store/employerSlice";
import "./LoginPage.css";

function LoginPage({ onLogin, setCurrentPage, setUser: setUserProp, setJobSeeker }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Role-based navigation helpers
  const goToJobSeekerProfile = () => navigate("/jobseeker/profile");
  const goToJobSeekerDashboard = () => navigate("/jobs");
  const goToEmployerProfile = () => navigate("/employer/profile");
  const goToEmployerDashboard = () => navigate("/employer/dashboard");
  const goToEmployerPending = () => navigate("/employer/pending");
  const goToEmployerRejected = () => navigate("/employer/rejected");
  const goToAdminDashboard = () => navigate("/admin/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Helper to normalize status checks (support "success", numeric 200, or string "200")
  const isSuccessStatus = (status) =>
    status === "success" || status === 200 || status === "200";

  const checkJobSeeker = async (id, token) => {
    try {
      const res = await apiFetch(`/api/jobseekers/checkuser/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const json = await res.json();

      if (!isSuccessStatus(json.status)) {
        setError(json.message || "Invalid job seeker response");
        return;
      }

      const data = json.data || {};
      console.log("Job Seeker Data:", data);

      // Accept either jobSeekerId or id shape
      const jobSeekerId = data.jobSeekerId ?? data.id ?? 0;
 console.log("Setting job seekerId:", jobSeekerId);
      if (!jobSeekerId) {
        // Profile incomplete - navigate to profile completion
        goToJobSeekerProfile();
      } else {
        // Profile complete - set job seeker data and go to dashboard
        console.log("Setting job seeker in parent prop:", data);
        if (typeof setJobSeeker === "function") setJobSeeker(data);
        dispatch(setJobSeekerAction(data));
        goToJobSeekerDashboard();
      }
    } catch (err) {
      console.error("Error checking job seeker:", err);
      setError("Server error while checking job seeker");
      // fallback: send to profile
      goToJobSeekerProfile();
    }
  };

  const checkEmployer = async (id, token) => {
    try {
      const res = await apiFetch(`/api/employers/checkuser/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const json = await res.json();

      if (!isSuccessStatus(json.status)) {
        setError(json.message || "Invalid employer response");
        return;
      }

      const data = json.data || {};
      console.log("Employer Data:", data);
      dispatch(setEmployerAction(data));

      const employerId = data.employerId ?? data.id ?? 0;
      const approvalStatus = (data.approvalStatus || "").toUpperCase();

      if (!employerId) {
        goToEmployerProfile();
      } else if (approvalStatus === "PENDING") {
        goToEmployerPending();
      } else if (approvalStatus === "APPROVED") {
        goToEmployerDashboard();
      } else if (approvalStatus === "REJECTED") {
        goToEmployerRejected();
      } else {
        goToEmployerDashboard();
      }
    } catch (err) {
      console.error("Error checking employer:", err);
      setError("Server error while checking employer");
      goToEmployerProfile();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await apiFetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();

      if (!isSuccessStatus(json.status)) {
        setError(json.message || "Invalid login credentials");
        return;
      }

      const data = json.data || {};

      // Try multiple token field names (token, jwtToken, jwt)
      const token = data.token ?? data.jwtToken ?? data.jwt ?? null;
      if (token) {
        // persist token both in your api helper and redux
        saveTokenToLocal(token);
        dispatch(setTokenAction(token));
      }

      // Normalize user object from possible shapes returned by backend
      const user = data.user ?? {
        userId: data.userId ?? data.id,
        id: data.userId ?? data.id,
        email: data.email,
        name: data.name ?? data.fullName ?? "",
        userType: (data.userType || data.role || "").toUpperCase(),
        status: data.status,
      };

      console.log("About to dispatch user to Redux:", user);

      // Update parent prop if provided
      if (typeof setUserProp === "function") {
        setUserProp(user);
      }

      // Save in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(user));
      dispatch(setUserAction(user));

      // Route based on user type - allow variations like "JOB_SEEKER" or "JOBSEEKER"
      const userType = (user.userType || "").replace(/[-_\s]/g, "").toUpperCase();
      if (userType.includes("JOB")) {
        await checkJobSeeker(user.userId ?? user.id, token);
      } else if (userType.includes("EMPLOYER")) {
        await checkEmployer(user.userId ?? user.id, token);
      } else if (userType.includes("ADMIN")) {
        goToAdminDashboard();
      } else {
        setError("Unknown user type");
      }

      if (typeof onLogin === "function") {
        onLogin(user);
      }

      setMessage("Login successful");
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error during login");
    }
  };

  // Example logout helper (keeps here if you want to expand)
  const handleLogout = () => {
    console.log("logging out");
    localStorage.removeItem("user");
    dispatch(setUserAction(null));
    dispatch(setTokenAction(null));
    saveTokenToLocal(null);
    navigate("/login");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your JobPortal account</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <a href="/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
