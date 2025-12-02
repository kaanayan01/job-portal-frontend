
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch, getToken } from "../api";

function CompanyDetailPage({employer,setCurrentPage}) {
//  const { employerId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const gotoPreviousPage = () => setCurrentPage("admDashboard");
  const fetchEmployerDetails = async () => {
    try {
        // console.log('employer id = '+ employerId);
      setLoading(true);
      const token = getToken();
      const id = parseInt(employer.employerId);
      console.log(id);
      const response = await apiFetch(`/api/company-profiles/employer/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const json = await response.json();
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
  }, [employer]);


  const popBack = () => {
    gotoPreviousPage();
    
   };

   
const handleApprove = async () => {
    try {
      const token = getToken();
      const response = await apiFetch(`/api/admins/employer/${employer.employerId}/status?status=APPROVED`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        const json = await response.json();
        console.log("Employer status updated:", json);
        alert("Employer approved successfully!");
        popBack();
          
      } else {
        console.error("Failed to update status:", response);
        popBack();
        alert("Failed to approve employer.");
       
      }
    } catch (error) {
      console.error("Error updating employer status:", error);
      alert("An error occurred while approving employer.");
      popBack();
     
    }
};

const handleReject = async () => {
    try {
      const token = getToken();
      const response = await apiFetch(`/api/admins/employer/${employer.employerId}/status?status=REJECTED`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        const json = await response.json();
        console.log("Employer status updated:", json);
        alert("Employer rejection successfully!");
        popBack();
      } else {
        console.error("Failed to update status:", response);
        popBack();
        alert("Failed to rejection employer.");
    
      }
    } catch (error) {
      console.error("Error updating employer status:", error);
      alert("An error occurred while approving employer.");
      popBack();
      
    }
};
  return (
    <div className="main-container">
        <button
            className="btn btn-primary"
            onClick={() => popBack()}
          >
            Back
          </button>
      <h2>Employer Details</h2>
      {loading ? (
        <p>Loading details...</p>
      ) : details ? (
        <div>
          <p><strong>ID:</strong> {details[0].profileId}</p>
          <p><strong>Email:</strong> {employer.contactEmail}</p>
          <p><strong>Contact:</strong> {employer.contactNumber}</p>
          <p><strong>Website:</strong> {details[0].website}</p>
          <p><strong>Description:</strong> {details[0].description}</p>
          <p><strong>Status:</strong> {employer.approvalStatus}</p>
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
  onClick={() => handleApprove()}
>
  Approve
</button>
<button
  style={{
    backgroundColor: "red", // Green color
    color: "white",
    border: "none",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "4px",
    cursor: "pointer"
  }}
  onClick={() => handleReject()}
>
  Reject
</button>

        </div>
        
      ) : (
        <p>No details found.</p>
      )}
    </div>
  );
}

export default CompanyDetailPage;