import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiFetch, getToken } from "../api";
import "../App.css";
import { useReduxJobSeeker } from "../hooks/useReduxUser";

// Helper function to get today's application count
const getTodayApplicationCount = () => {
  const today = new Date().toDateString();
  const appData = JSON.parse(localStorage.getItem("dailyApplications") || "{}");
  return appData[today] || 0;
};

// Helper function to increment today's application count
const incrementTodayApplicationCount = () => {
  const today = new Date().toDateString();
  const appData = JSON.parse(localStorage.getItem("dailyApplications") || "{}");
  appData[today] = (appData[today] || 0) + 1;
  localStorage.setItem("dailyApplications", JSON.stringify(appData));
};

function ApplyJobPage(){
    const navigate = useNavigate();
    const jobSeekerBody = useReduxJobSeeker() ;
    const jobSeeker = jobSeekerBody?.jobSeeker || {};
    const isPremium = useSelector(state => state.jobSeeker?.jobSeeker?.subscriptionType === 'PREMIUM');
    console.log("jobSeeker in ApplyJobPage:", jobSeeker);
    console.log("isPremium:", isPremium);
    const job = JSON.parse(localStorage.getItem("selectedJob"));
    useEffect(() => {
      console.log(job);
      console.log(jobSeeker);
      }, []);
 
  const [form, setForm] = useState({
    coverletter: "",

  });
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check daily application limit for free users
    if (!isPremium) {
      const todayCount = getTodayApplicationCount();
      if (todayCount >= 5) {
        alert(" You've reached your daily application limit (5 per day). Upgrade to Premium for unlimited applications!");
        return;
      }
    }

    console.log("Submit JOb Api Initiated --->");
    try {
     
      const jobSeekerId= jobSeeker.jobSeekerId;
      const jobId = job.jobId;

      console.log('------------'+jobSeekerId);
      console.log('------------'+jobId);

      const token = getToken();
      const res = await apiFetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined, 
        },
        body: JSON.stringify({
            jobSeekerId,
            jobId,
            coverLetter: form.coverletter || ""
        }),
      });

      const json = await res.json();
      console.log("Application response:", json);

      if (res.status === 200 || res.status === 201 || (json.status === 200 && res.ok)) {
        // Increment application count on successful submission
        if (!isPremium) {
          incrementTodayApplicationCount();
          const remaining = 5 - getTodayApplicationCount();
          alert(`✓ Applied Successfully!\nRemaining applications today: ${remaining}/5`);
        } else {
          alert("✓ Applied Successfully!");
        }
        navigate("/jobs");
        return;
      }
      
      const errorMessage = json.message || "Failed to submit application. Please try again.";
      alert(errorMessage);

     
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
      <h2>Apply Job</h2>

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