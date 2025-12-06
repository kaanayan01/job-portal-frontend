
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiFetch, getToken } from "../api";
import "../App.css";

export default function CompanyCompleteProfile({ user, setCurrentPage, employerID }) {
  const goToDashboard = () => setCurrentPage("dashboard");
  
  // Get employer from Redux
  const employer = useSelector((state) => state.employer?.employer);

  const [form, setForm] = useState({
    userId: user.userId,
    company_name: "",
    industry: "",
    address: "",
    description: "",
    logo: null, // For file upload
    website: "",
  });

  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);

  // Fetch employer profile on mount
  useEffect(() => {
    if (employer && employer.employerId) {
      console.log("Fetching employer profile with employerId:", employer.employerId);
      fetchProfileData(employer.employerId);
    }
  }, [employer]);

  // Fetch employer profile from backend
  const fetchProfileData = async (employerId) => {
    try {
      setProfileLoading(true);
      const token = getToken();
      
      const res = await apiFetch(`/api/employers/${employerId}?employer_id=${employerId}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const json = await res.json();
      console.log("Employer Profile Data Response:", json);

      if (res.status === 200 && json.data) {
        setProfileData(json.data);
      } else if (res.status === 200 && json.status === "success") {
        setProfileData(json);
      }
    } catch (err) {
      console.error("Error fetching employer profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      setForm((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit Company Profile API Initiated --->");

    try {
      const formData = new FormData();
      formData.append("userId", form.userId);
      formData.append("company_name", form.company_name);
      formData.append("industry", form.industry);
      formData.append("address", form.address);
      formData.append("description", form.description);
      formData.append("website", form.website);
      formData.append("employerId", employerID);
      if (form.logo) {
        formData.append("logo", form.logo);
      }

      const res = await apiFetch("/api/company-profiles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData, // Sending as multipart/form-data
      });

      const json = await res.json();
      console.log("Company Profile response:", json);

      if (json.status !== "success" && json.status !== 201) {
        return;
      }

      goToDashboard();
    } catch (err) {
      console.error("Company Profile error:", err);
    }
  };

  return (
    <div className="main-container">
      <h2>Complete Company Profile</h2>

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
          <h3>Company Details</h3>
          {profileLoading ? (
            <p className="loading">Loading profile...</p>
          ) : (
            <div className="profile-details">
              <div className="profile-section">
                <h4>Company Information</h4>
                <div className="detail-item">
                  <span className="detail-label">Company Name:</span>
                  <span className="detail-value">{profileData.company_name || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Industry:</span>
                  <span className="detail-value">{profileData.industry || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{profileData.address || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Website:</span>
                  <span className="detail-value">
                    {profileData.website ? (
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                        {profileData.website}
                      </a>
                    ) : "N/A"}
                  </span>
                </div>
              </div>

              <div className="profile-section">
                <h4>Description</h4>
                <p>{profileData.description || "No description provided"}</p>
              </div>

              {profileData.logo && (
                <div className="profile-section">
                  <h4>Company Logo</h4>
                  <img src={profileData.logo} alt="Company Logo" className="company-logo" />
                </div>
              )}

              <div className="profile-section">
                <h4>Additional Information</h4>
                <div className="detail-item">
                  <span className="detail-label">Contact Email:</span>
                  <span className="detail-value">{profileData.contactEmail || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Number:</span>
                  <span className="detail-value">{profileData.contactNumber || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="form-shell">
          <form className="form" onSubmit={handleSubmit}>
          {/* Company Name */}
          <div className="form-row">
            <label className="form-label">Company Name</label>
            <input
              className="form-input"
              type="text"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              placeholder="Enter company name"
              required
            />
          </div>

          {/* Industry */}
          <div className="form-row">
            <label className="form-label">Industry</label>
            <input
              className="form-input"
              type="text"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="Enter industry"
              required
            />
          </div>

          {/* Address */}
          <div className="form-row">
            <label className="form-label">Address</label>
            <input
              className="form-input"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
              required
            />
          </div>

          {/* Description */}
          <div className="form-row">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter company description"
              rows="4"
              required
            ></textarea>
          </div>

          {/* Logo Upload
          <div className="form-row">
            <label className="form-label">Company Logo</label>
            <input
              className="form-input"
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
            />
          </div> */}

          {/* Website */}
          <div className="form-row">
            <label className="form-label">Website</label>
            <input
              className="form-input"
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <button className="btn btn-primary" type="submit">
            Save Company Profile
          </button>
        </form>
        </div>
      )}
    </div>
  );
}

