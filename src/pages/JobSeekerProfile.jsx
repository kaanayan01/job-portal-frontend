import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiFetch, API_BASE_URL } from "../api";
import "../App.css";
import "./JobSeekerProfile.css";

function JobSeekerProfile({user, setCurrentPage}) {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => {
    console.log("useSelector - Full Redux state:", state);
    console.log("useSelector - state.user:", state.user);
    console.log("useSelector - state.user.user:", state.user?.user);
    return state.user?.user;
  });
  const effectiveUser = reduxUser || user;
  
  const goToJobSeeker = () => {
    if (setCurrentPage) {
      setCurrentPage("jobseeker");
    } else {
      navigate("/jobs");
    }
  };
  const [form, setForm] = useState({
    userId: '',
    skills: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  // Initialize userId from effectiveUser when component mounts or user changes
  useEffect(() => {
    console.log("JobSeekerProfile useEffect triggered");
    console.log("  - effectiveUser:", effectiveUser);
    console.log("  - reduxUser:", reduxUser);
    console.log("  - user prop:", user);
    
    if (effectiveUser && effectiveUser.userId) {
      console.log("  ✓ Setting userId to:", effectiveUser.userId);
      setForm((prev) => ({ ...prev, userId: effectiveUser.userId }));
    } else {
      console.log("  ✗ No userId found in effectiveUser");
    }
  }, [effectiveUser, reduxUser, user]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit - form.userId:", form.userId, "reduxUser:", reduxUser, "user:", user);
    
    // ensure we have a user id before proceeding
    if (!form.userId) {
      setErrorMsg('User not available — please login and try again.');
      return;
    }

  
console.log("Submit Profile Api Initiated --->");
    try {
      const userId = form.userId;
      const skills = form.skills ? form.skills.split(",") : [];

      let res;
      // If a resume file is provided, use multipart/form-data endpoint (previous API)
      if (resumeFile) {
        const fd = new FormData();
        fd.append("userId", userId);
        fd.append("skills", JSON.stringify(skills));
        fd.append("resume", resumeFile);

        // previous API expects multipart/form-data at /api/jobseekers/profile
        res = await fetch(API_BASE_URL + "/api/jobseekers/profile", {
          method: "POST",
          body: fd,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } else {
        // current API (JSON)
        res = await apiFetch("/api/jobseekers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId,
            skills,
          }),
        });
      }

      const json = await res.json().catch(() => ({}));
      console.log("Register response:", json);

      if (json.status !== "success" && json.status !== 201) {
        goToJobSeeker();
        return;
      }

     
    } catch (err) {
      console.error("Register error:", err);
      setErrorMsg('Failed to save profile. Please try again later.');
    }
  };

 
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  
  };

  const submit = (e) => {

    e.preventDefault();
    // Backend will connect this to JobSeekerController updateProfile endpoint.
    console.log("JobSeeker profile payload:", form);
    alert("Profile form submitted");
  };

  return (
    <div className="main-container">
      <h2>My Profile</h2>

      <div className="form-shell">
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        <form className="form" onSubmit={handleSubmit}>
         

          <div className="form-row">
            <label className="form-label">Skills (comma separated)</label>
            <input
              className="form-input"
              name="skills"
              value={form.skills}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label className="form-label">Resume (optional)</label>
            <input className="form-input" type="file" onChange={(e)=>setResumeFile(e.target.files && e.target.files[0])} />
            <span className="section-subtitle">
          
            </span>
          </div>

          <button className="btn btn-primary" type="submit">
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default JobSeekerProfile;