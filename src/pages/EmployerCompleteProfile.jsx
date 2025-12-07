import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import "../App.css";
import { useReduxUser } from "../hooks/useReduxUser";
import { useDispatch, useSelector } from "react-redux";
import { setEmployer as setEmployerAction } from "../../src/store/employerSlice";

export default function EmployerCompanyProfile() {
  const user = useReduxUser();
  const employer = useSelector(state => state.employer?.employer);
  const dispatch = useDispatch();

  // Combined form state
  const [form, setForm] = useState({
    userId: user?.userId,
    contactEmail: "",
    contactNumber: "",
    company_name: "",
    industry: "",
    address: "",
    description: "",
    logo: null,
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [error, setError] = useState("");
  const [companyProfileId, setCompanyProfileId] = useState(null);

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetchingProfile(true);
        setError("");
        let hasCompanyProfile = false;

        // Fetch employer details
        if (employer?.employerId) {
          const employerRes = await apiFetch(`/api/employers/${employer.employerId}`);
          const employerData = await employerRes.json();

          if (employerRes.status === 200 && employerData.data) {
            setForm(prev => ({
              ...prev,
              contactEmail: employerData.data.contactEmail || "",
              contactNumber: employerData.data.contactNumber || "",
            }));
            console.log("Employer details loaded:", employerData.data);
          }

          // Fetch company profile by employer ID first to get the company profile ID
          const companyRes = await apiFetch(`/api/company-profiles/employer/${employer.employerId}`);
          const companyData = await companyRes.json();

          console.log("Company profile response status:", companyRes.status);
          console.log("Company profile response:", companyData);

          if (companyRes.status === 200 && companyData) {
            // Handle both nested (data wrapper) and direct response formats
            console.log("Company profile data found:", companyData);
            const profileData = companyData.data[0] || companyData;
            const profileId = profileData.profileId || profileData.id;
            setCompanyProfileId(profileId);
            
            setForm(prev => ({
              ...prev,
              
              company_name: profileData.companyName || "",
              industry: profileData.industry || "",
              address: profileData.address || "",
              description: profileData.description || "",
              website: profileData.website || "",
            }));
            hasCompanyProfile = true;
            console.log("Company details loaded:", profileData);
            console.log("Company profile ID set to:",form);
          } else {
            console.log("No company profile found, will allow creation");
          }
          
          setProfileExists(hasCompanyProfile);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. You may need to create one.");
      } finally {
        setFetchingProfile(false);
      }
    };

    if (user?.userId) {
      fetchProfile();
    }
  }, [employer, user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      setForm((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const hasNoSpecialCharacters = (text) => {
    // Allow only alphanumeric, spaces, hyphens, periods, and commas
    const specialCharRegex = /^[a-zA-Z0-9\s\-.,&()]+$/;
    return specialCharRegex.test(text);
  };

  const isValidWebsite = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    // Email validation
    if (form.contactEmail && !isValidEmail(form.contactEmail)) {
      setError("Invalid email format. Email must contain '@' and a valid domain.");
      return false;
    }

    // Phone number validation
    if (form.contactNumber && !isValidPhoneNumber(form.contactNumber)) {
      setError("Invalid phone number. Please enter a 10-digit number.");
      return false;
    }

    // Company name validation
    if (form.company_name && !hasNoSpecialCharacters(form.company_name)) {
      setError("Company name contains invalid special characters. Only letters, numbers, spaces, hyphens, periods, commas, and parentheses are allowed.");
      return false;
    }

    // Industry validation
    if (form.industry && !hasNoSpecialCharacters(form.industry)) {
      setError("Industry contains invalid special characters. Only letters, numbers, spaces, hyphens, periods, commas, and parentheses are allowed.");
      return false;
    }

    // Address validation
    if (form.address && !hasNoSpecialCharacters(form.address)) {
      setError("Address contains invalid special characters. Only letters, numbers, spaces, hyphens, periods, commas, and parentheses are allowed.");
      return false;
    }

    // Description validation
    if (form.description && !hasNoSpecialCharacters(form.description)) {
      setError("Description contains invalid special characters. Only letters, numbers, spaces, hyphens, periods, commas, and parentheses are allowed.");
      return false;
    }

    // Website validation
    if (form.website && !isValidWebsite(form.website)) {
      setError("Invalid website URL. Please enter a valid URL (e.g., https://www.example.com).");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log("Combined Profile Submission Initiated --->");

    try {
      let employerId = employer?.employerId;

      // Step 1: Save or Update Employer Profile
      if (!employerId) {
        const employerRes = await apiFetch("/api/employers", {
          method: "POST",
          body: JSON.stringify({
            userId: form.userId,
            contactEmail: form.contactEmail,
            contactNumber: form.contactNumber,
            "approvalStatus": "PENDING"
          }),
        });
        
        const employerJson = await employerRes.json();
        console.log("Employer Profile Response:", employerJson);

        if (employerRes.status !== 200 && employerRes.status !== 201) {
          console.error("Employer Profile submission failed:", employerJson);
          alert("Failed to save Employer Profile: " + (employerJson.message || "Unknown error"));
          setLoading(false);
          return;
        }

        if (!employerJson.data || !employerJson.data.employerId) {
          console.error("No employerId returned from API");
          alert("Failed to get employer ID from server");
          setLoading(false);
          return;
        }
        dispatch(setEmployerAction(employerJson.data));
        employerId = employerJson.data.employerId;
      } else {
        // Update existing employer profile
        const employerRes = await apiFetch(`/api/employers/${employerId}`, {
          method: "PUT",
          body: JSON.stringify({
            contactEmail: form.contactEmail,
            contactNumber: form.contactNumber,
          }),
        });

        if (employerRes.status !== 200 && employerRes.status !== 201) {
          const employerJson = await employerRes.json();
          alert("Failed to update Employer Profile: " + (employerJson.message || "Unknown error"));
          setLoading(false);
          return;
        }
      }

      // Step 2: Save or Update Company Profile
      const companyProfileData = {
        profileId: companyProfileId,
        userId: form.userId,
        employerId: employerId,
        companyName: form.company_name,
        industry: form.industry,
        address: form.address,
        description: form.description,
        website: form.website,
      };

      console.log("Sending company profile with employerId:", employerId);
      
      let companyRes;
      if (profileExists && companyProfileId) {
        // Update existing company profile using the profile ID
        companyRes = await apiFetch(`/api/company-profiles/${companyProfileId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(companyProfileData),
        });
      } else {
        // Create new company profile
        companyRes = await apiFetch("/api/company-profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(companyProfileData),
        });
      }

      const companyJson = await companyRes.json();
      console.log("Company Profile Response JSON:", companyJson);

      if (companyRes.status === 200 || companyRes.status === 201 || companyJson.status === "success") {
        console.log("Company profile saved successfully!");
        // Store the company profile ID if it's a new profile
        if (!companyProfileId && companyJson.data?.id) {
          setCompanyProfileId(companyJson.data.id);
        }
        alert("Profile updated successfully!");
        setIsEditMode(false);
        setProfileExists(true);
      } else {
        console.error("Company Profile submission failed. Status:", companyRes.status, "Response:", companyJson);
        alert("Failed to save Company Profile: " + (companyJson.message || "Status: " + companyRes.status));
      }
    } catch (err) {
      console.error("Error submitting profiles:", err);
      alert("An error occurred while saving profiles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{isEditMode ? 'Edit Profile' : 'Employer & Company Profile'}</h2>
        {profileExists && !isEditMode && (
          <button 
            onClick={() => setIsEditMode(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {fetchingProfile && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Loading profile...</p>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* View Mode - Show profile details when loaded and not in edit mode */}
      {!isEditMode && !fetchingProfile && profileExists && (
        <div className="form-shell" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>📋 Employer Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Contact Email</p>
                <p style={{ margin: 0, color: '#333', fontSize: '0.95rem' }}>{form.contactEmail || 'Not provided'}</p>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Contact Number</p>
                <p style={{ margin: 0, color: '#333', fontSize: '0.95rem' }}>{form.contactNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>🏢 Company Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Company Name</p>
                <p style={{ margin: 0, color: '#333', fontSize: '0.95rem' }}>{form.company_name || 'Not provided'}</p>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Industry</p>
                <p style={{ margin: 0, color: '#333', fontSize: '0.95rem' }}>{form.industry || 'Not provided'}</p>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Address</p>
                <p style={{ margin: 0, color: '#333', fontSize: '0.95rem' }}>{form.address || 'Not provided'}</p>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Website</p>
                <p style={{ margin: 0, color: '#333', fontSize: '0.95rem' }}>
                  {form.website ? <a href={form.website} target="_blank" rel="noopener noreferrer">{form.website}</a> : 'Not provided'}
                </p>
              </div>
              <div style={{ gridColumn: '1 / -1', background: 'white', padding: '12px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Description</p>
                <p style={{ margin: 0, color: '#333', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{form.description || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Mode - Show form when in edit mode OR when no profile exists yet */}
      {!fetchingProfile && (isEditMode || !profileExists) && (
        <div className="form-shell">
          <form className="form" onSubmit={handleSubmit}>
            <h3>Employer Details</h3>
            <div className="form-row">
              <label className="form-label">Contact Email</label>
              <input
                className="form-input"
                type="email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              {form.contactEmail && !isValidEmail(form.contactEmail) && (
                <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '4px' }}>
                  ⚠️ Email must contain '@' and a valid domain (e.g., user@example.com)
                </p>
              )}
            </div>

            <div className="form-row">
              <label className="form-label">Contact Number</label>
              <input
                className="form-input"
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                pattern="[0-9]{10}"
                required
              />
              {form.contactNumber && !isValidPhoneNumber(form.contactNumber) && (
                <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '4px' }}>
                  ⚠️ Phone number must be exactly 10 digits
                </p>
              )}
            </div>

            <h3>Company Details</h3>
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
              {form.company_name && !hasNoSpecialCharacters(form.company_name) && (
                <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '4px' }}>
                  ⚠️ No special characters allowed (except -, ., comma, & and parentheses)
                </p>
              )}
            </div>

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
              {form.industry && !hasNoSpecialCharacters(form.industry) && (
                <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '4px' }}>
                  ⚠️ No special characters allowed (except -, ., comma, & and parentheses)
                </p>
              )}
            </div>

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
              {form.address && !hasNoSpecialCharacters(form.address) && (
                <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '4px' }}>
                  ⚠️ No special characters allowed (except -, ., comma, & and parentheses)
                </p>
              )}
            </div>

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
              {form.description && !hasNoSpecialCharacters(form.description) && (
                <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '4px' }}>
                  ⚠️ No special characters allowed (except -, ., comma, & and parentheses)
                </p>
              )}
            </div>

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
              {form.website && !isValidWebsite(form.website) && (
                <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '4px' }}>
                  ⚠️ Invalid website URL. Please enter a valid URL (e.g., https://www.example.com)
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </button>
              {profileExists && (
                <button 
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.95rem'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
