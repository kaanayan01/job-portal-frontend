import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiFetch, API_BASE_URL, getToken } from "../api";
import { setJobSeeker } from "../store/jobSeekerSlice";
import "../App.css";
import "./JobSeekerProfile.css";

function JobSeekerProfile({user, setCurrentPage}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const [successMsg, setSuccessMsg] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileView, setShowProfileView] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);

  // Initialize userId from effectiveUser when component mounts or user changes
  useEffect(() => {
    console.log("JobSeekerProfile useEffect triggered");
    console.log("  - effectiveUser:", effectiveUser);
    console.log("  - reduxUser:", reduxUser);
    console.log("  - jobSeeker:", jobSeeker);
    console.log("  - user prop:", user);
    
    if (effectiveUser && effectiveUser.userId) {
      console.log("   Setting userId to:", effectiveUser.userId);
      setForm((prev) => ({ ...prev, userId: effectiveUser.userId }));
    } else {
      console.log("   No userId found in effectiveUser");
    }

    // Fetch profile data using jobSeekerId
    if (jobSeeker && jobSeeker.jobSeekerId) {
      console.log("   Fetching profile with jobSeekerId:", jobSeeker.jobSeekerId);
      fetchProfileData(jobSeeker.jobSeekerId);
      setIsNewProfile(false);
    } else {
      console.log("   No jobSeekerId found - this is a new profile");
      // This is a newly registered user without a profile yet
      setIsNewProfile(true);
      setShowProfileView(false); // Show the form for new users
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
    setErrorMsg("");
    setSuccessMsg("");
    
    console.log("handleSubmit - form.userId:", form.userId, "reduxUser:", reduxUser, "user:", user);
    
    // ensure we have a user id before proceeding
    if (!form.userId) {
      setErrorMsg('User not available — please login and try again.');
      return;
    }

    // Validate skills are provided
    if (!form.skills || form.skills.trim() === "") {
      setErrorMsg('Skills are required. Please add at least one skill.');
      return;
    }

    setIsSubmitting(true);
    console.log("Submit Profile Api Initiated --->");
    try {
      const userId = form.userId;
      const jobSeekerId = jobSeeker?.jobSeekerId;
      const skills = form.skills ? form.skills.split(",").map(s => s.trim()) : [];

      let res;
      const token = getToken();

      // If jobSeeker exists, use PUT to update profile
      if (jobSeekerId) {
        console.log("Updating existing profile with jobSeekerId:", jobSeekerId);
        
        const updateData = {
          userId,
          skills,
        };

        res = await apiFetch(`/api/jobseekers/${jobSeekerId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
      } else {
        // Create new profile if no jobSeekerId exists
        console.log("Creating new profile");

        res = await apiFetch("/api/jobseekers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            skills,
          }),
        });
      }

      const json = await res.json().catch(() => ({}));
      console.log("Response:", json);

      if (res.status === 200 || res.status === 201 || json.status === "success") {
        const message = jobSeekerId ? "Profile updated successfully!" : "Profile created successfully!";
        setSuccessMsg(message);
        
        // For new profile creation, store the jobSeekerId in Redux
        if (!jobSeekerId && json.data && json.data.jobSeekerId) {
          dispatch(setJobSeeker(json.data));
          setIsNewProfile(false);
        }
        
        // Refresh profile data
        if (jobSeekerId) {
          fetchProfileData(jobSeekerId);
        } else if (json.data && json.data.jobSeekerId) {
          fetchProfileData(json.data.jobSeekerId);
        }
        
        // Clear form and reset state
        setResumeFile(null);
        
        // If resumeFile was selected, upload it separately
        if (resumeFile && (jobSeekerId || (json.data && json.data.jobSeekerId))) {
          const seekerId = jobSeekerId || json.data.jobSeekerId;
          await handleResumeUpload(seekerId);
        } else {
          setTimeout(() => {
            setShowProfileView(true);
          }, 1500);
        }
        return;
      }

     
    } catch (err) {
      console.error("Profile save error:", err);
      setErrorMsg('Failed to save profile. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resume upload separately
  const handleResumeUpload = async (jobSeekerId) => {
    if (!resumeFile) return;

    setIsUploadingResume(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await fetch(`${API_BASE_URL}/api/jobseekers/${jobSeekerId}/resume`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json().catch(() => ({}));
      console.log("Resume upload response:", json);

      if (res.status === 200 || res.status === 201 || json.status === "success") {
        setSuccessMsg("Resume uploaded successfully!");
        setResumeFile(null);
        
        // Refresh profile data to show updated resume
        if (jobSeekerId) {
          await fetchProfileData(jobSeekerId);
        }
        
        setTimeout(() => {
          setShowProfileView(true);
        }, 1500);
      } else {
        setErrorMsg("Failed to upload resume. Please try again.");
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      setErrorMsg("Error uploading resume. Please try again.");
    } finally {
      setIsUploadingResume(false);
    }
  };

 
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  
  };

  return (
    <div className="main-container">
      <h2>My Profile</h2>

      <div className="profile-actions">
        <button 
          className={`profile-btn ${showProfileView ? 'active' : ''}`}
          onClick={() => setShowProfileView(true)}
          disabled={profileLoading || !profileData}
          hidden={showProfileView}
        >
           View Profile
        </button>
      </div>

      {showProfileView && profileData ? (
        <div className="profile-view-container">
          <div className="profile-view-header">
            <h3>Profile Details</h3>
            <div className="profile-header-buttons">
              {jobSeeker && (
                <button 
                  className="edit-profile-btn"
                  onClick={() => {
                    // Populate form with existing data for editing
                    if (profileData.skills && Array.isArray(profileData.skills)) {
                      setForm(prev => ({
                        ...prev,
                        skills: profileData.skills.join(", ")
                      }));
                    }
                    setShowProfileView(false);
                  }}
                >
                  ✏️ Update Profile
                </button>
              )}
              <button 
                className="close-profile-btn"
                onClick={() => setShowProfileView(false)}
              >
                ✕ Close
              </button>
            </div>
          </div>
          {profileLoading ? (
            <p className="loading">Loading profile...</p>
          ) : (
            <div className="profile-details">
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
                  <span className="detail-label">Type:</span>
                  <span className={`subscription-badge ${(profileData.subscriptionType || 'FREE').toLowerCase()}`}>
                    {profileData.subscriptionType || "FREE"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {!showProfileView && (
        <div className="form-shell">
          {isNewProfile && (
            <div className="new-profile-prompt">
              <h3>🎯 Complete Your Profile</h3>
              <p>Welcome! To start applying for jobs, please complete your profile with your skills and upload your resume.</p>
            </div>
          )}
          <h3>{isNewProfile ? "Create Your Profile" : "Update Your Profile"}</h3>
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-label">Skills (comma separated) <span className="required">*</span></label>
              <input
                className="form-input"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g. Java, React, Python"
                required
              />
            </div>

            <div className="form-row">
              <label className="form-label">Resume </label>
              <input 
                className="form-input" 
                type="file" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    // Check file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      setErrorMsg("File size must be less than 5MB");
                      e.target.value = "";
                    } else {
                      setErrorMsg("");
                      setResumeFile(file);
                    }
                  }
                }}
              />
              {resumeFile && (
                <div className="file-info">
                  <span>📎 Selected: {resumeFile.name}</span>
                </div>
              )}
            </div>

            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={isSubmitting || isUploadingResume}
            >
              {isSubmitting || isUploadingResume ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default JobSeekerProfile;