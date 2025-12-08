
import React, { useState } from "react";
import { apiFetch } from "../api";
import "../App.css";
import { useReduxUser } from "../hooks/useReduxUser";
import { useDispatch } from "react-redux";
import { setEmployer as setEmployerAction } from "../../src/store/employerSlice";

export default function EmployerCompanyProfile({   }) {
  const user = useReduxUser();
  const goToPendingScreen = () => {
    alert("Profile submitted! Redirecting to pending approval screen.");
    window.location.href = "/employer/pending";
  };
  const dispatch = useDispatch();

  // Combined form state
  const [form, setForm] = useState({
    userId: user.userId,
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
    setLoading(true);
    console.log("Combined Profile Submission Initiated --->");

    try {
      // Step 1: Save Employer Profile
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
      console.log("Employer Response Status:", employerRes.status);

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
      dispatchEvent(setEmployerAction(employerJson.data));
      const employerId = employerJson.data.employerId;

      // Step 2: Save Company Profile (JSON format)
      const companyProfileData = {
        userId: form.userId,
        employerId: employerId,
        companyName: form.company_name,
        industry: form.industry,
        address: form.address,
        description: form.description,
        website: form.website,
      };

      console.log("Sending company profile with employerId:", employerId);
      
      const companyRes = await apiFetch("/api/company-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyProfileData),
      });

      const companyJson = await companyRes.json();
      console.log("Company Profile Response JSON:", companyJson);
      console.log("Company Profile Response Status:", companyRes.status);

      if (companyRes.status === 200 || companyRes.status === 201 || companyJson.status === "success") {
        console.log("Company profile saved successfully!");
        alert("Profile completed successfully!");
        goToPendingScreen();
        setLoading(false);
        return;
      }

      console.error("Company Profile submission failed. Status:", companyRes.status, "Response:", companyJson);
      alert("Failed to save Company Profile: " + (companyJson.message || "Status: " + companyRes.status));
      return;
    } catch (err) {
      console.error("Error submitting profiles:", err);
      alert("An error occurred while saving profiles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <h2>Complete Employer & Company Profile</h2>

      <div className="form-shell">
        <form className="form" onSubmit={handleSubmit}>
          {/* Employer Section */}
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
          </div>

          {/* Company Section */}
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
          </div>
{/* 
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

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );}
