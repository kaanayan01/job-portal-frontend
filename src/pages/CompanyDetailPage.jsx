
import  { useEffect, useState } from "react";
import { apiFetch, getToken } from "../api";
import { useLocation } from "react-router-dom";

function CompanyDetailPage() {
//  const { employerId } = useParams();
  const location = useLocation();
  const employer  = location.state?.employer || {};
 console.log("CompanyDetailPage - employer prop:", employer, location.state, location.state?.employer);

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const gotoPreviousPage = () => window.history.back();
  const fetchEmployerDetails = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const id = parseInt(employer.employerId);
      console.log("Fetching company profile for employer ID:", id);
      
      const response = await apiFetch(`/api/company-profiles/employer/${id}`, {
        method: "GET",
      });

      console.log("Company profile response status:", response.status);
      
      if (response.status === 200 || response.status === 201) {
        const json = await response.json();
        console.log("Company profile response data:", json);
        
        // API returns an array of company profiles
        if (Array.isArray(json.data) && json.data.length > 0) {
          console.log("Setting company details from array:", json.data);
          setDetails(json.data[0]); // Get first profile
        } else if (Array.isArray(json) && json.length > 0) {
          console.log("Response is array, setting first item:", json);
          setDetails(json[0]);
        } else if (json.data && !Array.isArray(json.data)) {
          console.log("Setting single object:", json.data);
          setDetails(json.data);
        } else {
          console.warn("No company profile data found");
          setDetails(null);
        }
      } else {
        console.error("Failed to fetch company profile, status:", response.status);
        setDetails(null);
      }
    } catch (error) {
      console.error("Error fetching employer details:", error);
      setDetails(null);
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
      <button className="btn btn-primary" onClick={() => popBack()}>
        Back
      </button>
      <h2>Employer Details</h2>
      {loading ? (
        <p>Loading details...</p>
      ) : details ? (
        <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
          {details.logo && (
            <div style={{ marginBottom: "20px" }}>
              <img src={details.logo} alt="Company Logo" style={{ maxWidth: "200px", height: "auto" }} />
            </div>
          )}
          
          <p><strong>Profile ID:</strong> {details.profileId || "N/A"}</p>
          <p><strong>Company Name:</strong> {details.companyName || "N/A"}</p>
          <p><strong>Industry:</strong> {details.industry || "N/A"}</p>
          <p><strong>Address:</strong> {details.address || "N/A"}</p>
          <p><strong>Description:</strong> {details.description || "N/A"}</p>
          <p><strong>Website:</strong> {details.website ? <a href={details.website} target="_blank" rel="noopener noreferrer">{details.website}</a> : "N/A"}</p>
          
          <hr style={{ margin: "20px 0" }} />
          
          <p><strong>Contact Email:</strong> {employer.contactEmail || "N/A"}</p>
          <p><strong>Contact Number:</strong> {employer.contactNumber || "N/A"}</p>
          <p><strong>Status:</strong> {employer.approvalStatus || "N/A"}</p>

          <div style={{ marginTop: "20px" }}>
            <button
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                fontSize: "16px",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px"
              }}
              onClick={() => handleApprove()}
            >
              Approve
            </button>
            <button
              style={{
                backgroundColor: "red",
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
        </div>
      ) : (
        <p>No company profile details found. Please ensure the company profile was saved correctly.</p>
      )}
    </div>
  );
}

export default CompanyDetailPage;