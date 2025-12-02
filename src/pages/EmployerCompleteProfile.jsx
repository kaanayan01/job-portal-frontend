
import React, { useState } from "react";
import { apiFetch } from "../api";
import "../App.css";

export default function EmployerCompanyProfile({ user, setCurrentPage }) {
  const goToPendingScreen = () => setCurrentPage("pendingScreen");

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: form.userId,
          contactEmail: form.contactEmail,
          contactNumber: form.contactNumber,
          "approvalStatus": "PENDING"
        }),
      });
      
      const employerJson = await employerRes.json();
      console.log("Employer Profile Response:", employerJson);

      if (employerJson.status !== 200) {
        alert("Failed to save Employer Profile");
        setLoading(false);
        return;
      }

      const employerId = employerJson.data.employerId;

      // Step 2: Save Company Profile
      const formData = new FormData();
      const userId= form.userId;
     
      const companyName= form.company_name;
      const industry=  form.industry;
      const address =form.address;
      const description = form.description;
      const website = form.website;
      
      // if (form.logo) {
      //   formData.append("logo", form.logo);
      // }

      const companyRes = await apiFetch("/api/company-profiles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: 
        JSON.stringify({
            userId,
            employerId,
            companyName,
               industry,
            address,
            description,
            website,
          })
        ,
      });

      const companyJson = await companyRes.json();
      console.log("Company Profile Response:", companyJson);

      if (companyJson.status === 200) {
        alert("Profile completed successfully!");
        goToPendingScreen();
        setLoading(false);
        return;
      }

      alert("Failed to save Company Profile");
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

          <div className="form-row">
            <label className="form-label">Company Logo</label>
            <input
              className="form-input"
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
            />
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
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );}
