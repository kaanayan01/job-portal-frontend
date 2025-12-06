import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiFetch, API_BASE_URL, getToken } from "../api";
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
  const jobSeeker = useSelector((state) => {
    console.log("useSelector - state.jobSeeker:", state.jobSeeker?.jobSeeker);
    return state.jobSeeker?.jobSeeker;
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
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);

  // Initialize userId from effectiveUser when component mounts or user changes
  useEffect(() => {
    console.log("JobSeekerProfile useEffect triggered");
    console.log("  - effectiveUser:", effectiveUser);
    console.log("  - reduxUser:", reduxUser);
    console.log("  - jobSeeker:", jobSeeker);
    console.log("  - user prop:", user);
    
    if (effectiveUser && effectiveUser.userId) {
      console.log("  ✓ Setting userId to:", effectiveUser.userId);
      setForm((prev) => ({ ...prev, userId: effectiveUser.userId }));
    } else {
      console.log("  ✗ No userId found in effectiveUser");
    }

    // Fetch profile data using jobSeekerId
    if (jobSeeker && jobSeeker.jobSeekerId) {
      console.log("  ✓ Fetching profile with jobSeekerId:", jobSeeker.jobSeekerId);
      fetchProfileData(jobSeeker.jobSeekerId);
    } else {
      console.log("  ✗ No jobSeekerId found");
    }
  }, [effectiveUser, reduxUser, user, jobSeeker]);

  // Fetch job seeker profile from backend
  const fetchProfileData = async (jobSeekerId) => {
    try {
      setProfileLoading(true);
      const token = getToken();
      
      const res = await apiFetch(`/api/jobseekers/${jobSeekerId}?job_seeker_id=${jobSeekerId}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const json = await res.json();
      console.log("Profile Data Response:", json);

      if (res.status === 200 && json.data) {
        setProfileData(json.data);
      } else if (res.status === 200 && json.status === "success") {
        setProfileData(json);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };
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

      <div className="profile-actions">
        <button 
          className={`profile-btn ${showProfileView ? 'active' : ''}`}
          onClick={() => setShowProfileView(!showProfileView)}
          disabled={profileLoading || !profileData}
        >
          {showProfileView ? "📝 Edit Profile" : "👁️ View Profile"}
        </button>
      </div>

      {showProfileView && profileData ? (
        <div className="profile-view-container">
          <h3>Profile Details</h3>
          {profileLoading ? (
            <p className="loading">Loading profile...</p>
          ) : (
            <div className="profile-details">
              <div className="profile-section">
                <h4>Basic Information</h4>
                <div className="detail-item">
                  <span className="detail-label">User ID:</span>
                  <span className="detail-value">{profileData.userId || profileData.jobSeekerId || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{profileData.email || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{profileData.phone || "N/A"}</span>
                </div>
              </div>

              <div className="profile-section">
                <h4>Skills</h4>
                {profileData.skills && profileData.skills.length > 0 ? (
                  <div className="skills-list">
                    {profileData.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No skills added yet</p>
                )}
              </div>

              {profileData.experience && (
                <div className="profile-section">
                  <h4>Experience</h4>
                  <p>{profileData.experience}</p>
                </div>
              )}

              {profileData.education && (
                <div className="profile-section">
                  <h4>Education</h4>
                  <p>{profileData.education}</p>
                </div>
              )}

              {profileData.resume && (
                <div className="profile-section">
                  <h4>Resume</h4>
                  <a href={profileData.resume} target="_blank" rel="noopener noreferrer" className="resume-link">
                    📄 Download Resume
                  </a>
                </div>
              )}

              <div className="profile-section">
                <h4>Subscription</h4>
                <div className="detail-item">
                  <span className="detail-label">Subscription Type:</span>
                  <span className={`subscription-badge ${(profileData.subscriptionType || 'FREE').toLowerCase()}`}>
                    {profileData.subscriptionType || "FREE"}
                  </span>
                </div>
              </div>

              <div className="profile-section">
                <h4>Additional Information</h4>
                <div className="detail-item">
                  <span className="detail-label">Profile Created:</span>
                  <span className="detail-value">
                    {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">
                    {profileData.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
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
            </div>

            <button className="btn btn-primary" type="submit">
              Save profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default JobSeekerProfile;