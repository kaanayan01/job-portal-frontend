
import React, { useState } from "react";
import { apiFetch } from "../api";
import "../App.css";

export default function CompanyCompleteProfile({ user, setCurrentPage,employerID }) {
  const goToDashboard = () => setCurrentPage("dashboard");

  const [form, setForm] = useState({
    userId: user.userId,
    company_name: "",
    industry: "",
    address: "",
    description: "",
    logo: null, // For file upload
    website: "",
  });

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

          {/* Logo Upload */}
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
    </div>
  );
}

