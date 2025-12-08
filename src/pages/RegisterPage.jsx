// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("JOB_SEEKER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          name,
          password,
          userType: role,
        }),
      });

      const json = await res.json().catch(() => ({}));
      console.log("Register response:", json);

      const extractValidationMessages = (payload) => {
        const msgs = [];
        if (!payload) return msgs;
        if (Array.isArray(payload.errors) && payload.errors.length) {
          payload.errors.forEach((e) => {
            if (typeof e === "string") msgs.push(e);
            else if (e && e.message) msgs.push(e.message);
          });
        }
        if (payload.validationErrors) {
          if (Array.isArray(payload.validationErrors)) msgs.push(...payload.validationErrors);
          else if (typeof payload.validationErrors === "object") msgs.push(...Object.values(payload.validationErrors).flat());
        }
        return msgs;
      };

      const isDuplicateEmail = () => {
        if (res && res.status === 409) return true;
        if (json && (json.code === 'EMAIL_EXISTS' || json.code === 'DUPLICATE_EMAIL')) return true;
        const msg = (json && (json.message || json.error || '')).toString();
        if (/email.*exist/i.test(msg) || /duplicate.*email/i.test(msg) || /unique.*email/i.test(msg)) return true;
        return false;
      };

      // If server returned 400 (Bad Request), show backend message if available
      if (res.status === 400) {
        // First check for errors object with field-specific messages
        if (json.errors && typeof json.errors === "object" && !Array.isArray(json.errors)) {
          const errorMsgs = Object.values(json.errors).filter(Boolean);
          if (errorMsgs.length) {
            setError(errorMsgs.join(' '));
            return;
          }
        }
        // Then check for errors array
        if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
          const errorMsgs = json.errors.map(e => typeof e === "string" ? e : e.message || e).filter(Boolean);
          if (errorMsgs.length) {
            setError(errorMsgs.join(' '));
            return;
          }
        }
        // Then check for message
        if (json.message) {
          setError(json.message);
          return;
        }
        // Then check for error
        if (json.error) {
          setError(json.error);
          return;
        }
        // Extract validation messages
        const validationMsgs = extractValidationMessages(json);
        if (validationMsgs.length) {
          setError(validationMsgs.join(' '));
          return;
        }
        // Fallback message
        setError('Invalid input. Please check your details and try again.');
        return;
      }

      // If server returned non-2xx, prefer showing validation messages but never raw backend message
      if (!res.ok) {
        if (isDuplicateEmail()) {
          setError('Email already exists. Please use another email or login.');
          return;
        }

        const validationMsgs = extractValidationMessages(json);
        if (validationMsgs.length) setError(validationMsgs.join(' '));
        else setError('Registration unsuccessful. Please try again.');
        return;
      }

      // If API response indicates failure, treat similarly
      if (json.status !== 'success' && json.status !== 201) {
        if (isDuplicateEmail()) {
          setError('Email already exists. Please use another email or login.');
          return;
        }

        const validationMsgs = extractValidationMessages(json);
        if (validationMsgs.length) setError(validationMsgs.join(' '));
        else setError('Registration unsuccessful. Please try again.');
        return;
      }

      setMessage("Registration successful! Redirecting to complete your profile...");
      
      // For job seekers, navigate to profile completion page
      if (role === "JOB_SEEKER") {
        setTimeout(() => {
          navigate("/jobseeker/profile");
        }, 1500);
      } else {
        // For employers, navigate to company profile completion
        setTimeout(() => {
          navigate("/employer/profile");
        }, 1500);
      }
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Register error:", err);
      setError("Registration unsuccessful. Server is not responding.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join JobPortal and start your journey</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              <option value="JOB_SEEKER">Job Seeker</option>
              <option value="EMPLOYER">Employer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              placeholder="Enter your full name"
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-toggle">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Create a strong password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input with-toggle"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-toggle">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                placeholder="Re-enter your password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input with-toggle"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="register-btn">
            Create Account
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
