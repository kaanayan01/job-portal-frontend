
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch, getToken } from "../api";

function JobDetailPage({job,setCurrentPage}) {
//  const { employerId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const gotoPreviousPage = () => setCurrentPage("jobseekerDashboard");
  const gotoApplyPage = () => setCurrentPage("applyJob");
  const fetchEmployerDetails = async () => {
    try {
        // console.log('employer id = '+ employerId);
      setLoading(true);
      const token = getToken();
      const id = parseInt(job.employerId);
      console.log(job.requirements);
      const response = await apiFetch(`/api/company-profiles/employer/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const json = await response.json();
        console.log(json.data);
        setDetails(json.data);
      }
    } catch (error) {
      console.error("Error fetching employer details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerDetails();
  }, [job]);


  const popBack = () => {
    gotoPreviousPage();
    
   };

   
  return (
    <div className="main-container">
        <button
            className="btn btn-primary"
            onClick={() => popBack()}
          >
            Back
          </button>
      <h2>Job Detail</h2>
      {loading ? (
        <p>Loading details...</p>
      ) : details ? (
        <div>
          <p><strong>ID:</strong> {job.jobId}</p>
          <p><strong>Title:</strong> {job.title}</p>
          <p><strong>Requirements:</strong> {job.requirements}</p>
          <p><strong>Website:</strong> {details[0].website}</p>
          <p><strong>Description:</strong> {job.description}</p>
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>Company Name:</strong> {details[0].companyName}</p>
          <p><strong>Industry:</strong> {details[0].industry}</p>
          <p><strong>Address:</strong> {details[0].address}</p>
          
<button
  style={{
    backgroundColor: "#28a745", // Green color
    color: "white",
    border: "none",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "4px",
    cursor: "pointer"
  }}
  onClick={() => gotoApplyPage()}
>Apply</button>

        </div>
        
      ) : (
        <p>No details found.</p>
      )}
    </div>
  );
}

export default JobDetailPage;