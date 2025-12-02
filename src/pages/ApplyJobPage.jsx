import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import "../App.css";

function ApplyJobPage({jobSeeker,job, setCurrentPage}) {
    useEffect(() => {
      console.log(job);
      console.log(jobSeeker);
      }, []);
  const goToJobSeeker = () => setCurrentPage("jobseekerDashboard");
  const [form, setForm] = useState({

   
    coverletter: "",

  });
  const handleSubmit = async (e) => {
    e.preventDefault();
  

  
console.log("Submit JOb Api Initiated --->");
    try {
     
const jobSeekerId= jobSeeker.jobSeekerId;
const jobId = job.jobId;

console.log('------------'+jobSeekerId);
console.log('------------'+jobId);

      const res = await apiFetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
        body: JSON.stringify({
            jobSeekerId,
           jobId
    
        }),
      });

      const json = await res.json();
      console.log("Register response:", json);

      if ( json.status === 200) {
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
            <label className="form-label">Coverletter</label>
            <textarea
              className="form-input"
              name="coverletter"
              value={form.coverletter}
              onChange={handleChange}
              placeholder="Type your coverletter"
              rows="4"
              required
            ></textarea>
          </div>
        

          <button className="btn btn-primary" type="submit">
           Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default ApplyJobPage;