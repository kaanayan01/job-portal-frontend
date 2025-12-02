// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { apiFetch } from "../api";

function RegisterPage() {
  const [role, setRole] = useState("JOB_SEEKER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
          userType: role, // ADMIN / EMPLOYER / JOB_SEEKER
        }),
      });

      const json = await res.json();
      console.log("Register response:", json);

      if (json.status !== "success" && json.status !== 201) {
        setError(json.message || "Registration failed.");
        return;
      }

      setMessage("Registration successful. Please login with your new account.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Register error:", err);
      setError("Server error while registering.");
    }
  };

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: "480px" }}>
      <h1>Create Account</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          I am a:
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="JOB_SEEKER">Job Seeker</option>
            <option value="EMPLOYER">Employer</option>
            {/* don’t expose ADMIN here */}
          </select>
        </label>

        <label>
          Full Name:
          <input
            type="text"
            value={name}
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <button type="submit" style={{ marginTop: "0.5rem" }}>
          Register
        </button>
      </form>

      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        Already have an account? Click <strong>Login</strong> in the top-right.
      </p>
    </div>
  );
}

export default RegisterPage;