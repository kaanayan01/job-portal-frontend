import React, { useState } from "react";
import { apiFetch } from "../api";

function EmployerCreateJob({ user,setCurrentPage }) {
  const [job, setJob] = useState({
    title: "",
    jobLocation: "",
    description: "",
    employerId: user.employerId
  });

  const submit = async (e) => {
    e.preventDefault();

    const res = await apiFetch("/api/jobs", {
      method: "POST",
      body: JSON.stringify(job)
    });

    alert("Job Created");
  };

  return (
    <div className="main-container">
      <h2>Create Job</h2>
      <form onSubmit={submit}>
        <input placeholder="Title" onChange={e=>setJob({...job,title:e.target.value})} />
        <input placeholder="Location" onChange={e=>setJob({...job,jobLocation:e.target.value})} />
        <textarea placeholder="Description" onChange={e=>setJob({...job,description:e.target.value})} />
        <button>Create Job</button>
      </form>
    </div>
  );
}

export default EmployerCreateJob;