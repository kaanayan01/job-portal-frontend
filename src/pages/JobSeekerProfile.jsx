import React, { useState } from "react";
import { apiFetch } from "../api";
import "../App.css";

function JobSeekerProfile({user, setCurrentPage}) {
  const goToJobSeeker = () => setCurrentPage("jobseeker");
  const [form, setForm] = useState({

    userId:user.userId,
    skills: "",

  });
  const handleSubmit = async (e) => {
    e.preventDefault();
     // if (!form.fullName || !form.skills || !form.resumeFile) {
    //  console.log(form);
     
    //   return;
    // }

  
console.log("Submit Profile Api Initiated --->");
    try {
      const userId = form.userId;
      const skills = form.skills.split(",");
      const res = await apiFetch("/api/jobseekers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
        body: JSON.stringify({
          userId,
          skills
        }),
      });

      const json = await res.json();
      console.log("Register response:", json);

      if (json.status !== "success" && json.status !== 201) {
        goToJobSeeker();
        return;
      }

     
    } catch (err) {
      console.error("Register error:", err);
     
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
            <label className="form-label">Resume (simulated)</label>
            <input className="form-input" type="file" />
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