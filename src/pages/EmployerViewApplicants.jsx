import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiFetch, getToken, API_BASE_URL } from "../api";
import "../App.css";

function EmployerViewApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const employer = useSelector(state => state.employer?.employer);
  const employerId = employer?.employerId || localStorage.getItem("employerId");
  
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, shortlisted, rejected, selected
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null); // For viewing applicant details
  const [downloadingResumeId, setDownloadingResumeId] = useState(null); // Track which resume is downloading
  const [loadingApplicantDetails, setLoadingApplicantDetails] = useState(false); // Track when fetching applicant details

  useEffect(() => {
    if (jobId && employerId) {
      fetchJobAndApplicants();
    } else {
      setError("Job ID or Employer ID not found");
      setLoading(false);
    }
  }, [jobId, employerId]);

  const fetchJobAndApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch job details to verify it belongs to this employer
      const jobRes = await apiFetch(`/api/jobs/${jobId}`);
      if (jobRes.status === 200) {
        const jobJson = await jobRes.json();
        const jobData = jobJson.data;
        
        // Verify the job belongs to this employer
        if (jobData.employerId !== parseInt(employerId)) {
          setError("You don't have permission to view applicants for this job");
          setLoading(false);
          return;
        }
        
        setJob(jobData);
      } else {
        throw new Error("Failed to fetch job details");
      }

      // Fetch applicants for this job
      const appRes = await apiFetch(`/api/applications/job/${jobId}`);
      if (appRes.status === 200) {
        const appJson = await appRes.json();
        const applicantsList = Array.isArray(appJson.data) ? appJson.data : [];
        
        // Transform the new DTO structure to match expected format
        const transformedApplicants = applicantsList.map(item => {
          // Handle both old format and new DTO format
          if (item.application) {
            return {
              ...item.application,
              jobSeeker: item.jobSeeker,
              user: item.user
            };
          }
          return item;
        });
        
        setApplicants(transformedApplicants);
        console.log("Applicants fetched:", transformedApplicants);
      } else {
        throw new Error("Failed to fetch applicants");
      }
    } catch (err) {
      console.error("Error fetching job/applicants:", err);
      setError("Error loading applicants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      
      const res = await apiFetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        body: JSON.stringify({ 
          applicationId: applicationId,
          status: newStatus 
        })
      });

      if (res.status === 200) {
        // Update the applicant in the list
        setApplicants(applicants.map(app => {
          const appId = app.applicationId || app.id;
          return appId === applicationId 
            ? { ...app, status: newStatus }
            : app;
        }));
        console.log("Application status updated:", newStatus);
      } else {
        const json = await res.json();
        setError(json.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Error updating status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewApplicantDetails = async (applicant) => {
    try {
      setLoadingApplicantDetails(true);
      
      // Get the job seeker ID - check both old and new format
      const jobSeekerId = applicant.jobSeekerId || applicant.jobSeeker?.jobSeekerId;
      
      if (!jobSeekerId) {
        console.log("No job seeker ID found in application, using existing data");
        setSelectedApplicant(applicant);
        setLoadingApplicantDetails(false);
        return;
      }

      // If we already have jobSeeker data in the applicant object, use it directly
      if (applicant.jobSeeker && Object.keys(applicant.jobSeeker).length > 1) {
        console.log("Using existing job seeker data from applicant");
        setSelectedApplicant(applicant);
        setLoadingApplicantDetails(false);
        return;
      }

      console.log("Fetching job seeker details for ID:", jobSeekerId);
      
      // Fetch complete job seeker details
      const res = await apiFetch(`/api/job-seekers/${jobSeekerId}`);
      
      if (res.status === 200) {
        const json = await res.json();
        const jobSeekerDetails = json.data;
        
        console.log("Job seeker details fetched:", jobSeekerDetails);
        
        // Merge the fetched details with the applicant data
        setSelectedApplicant({
          ...applicant,
          jobSeeker: jobSeekerDetails
        });
      } else {
        console.log("Failed to fetch job seeker details, using existing data");
        setSelectedApplicant(applicant);
      }
    } catch (err) {
      console.error("Error fetching job seeker details:", err);
      // Fall back to the applicant data we already have
      setSelectedApplicant(applicant);
    } finally {
      setLoadingApplicantDetails(false);
    }
  };

  const handleCloseApplicantModal = () => {
    setSelectedApplicant(null);
  };

  const handleDownloadResume = async (applicant) => {
    if (!applicant.jobSeeker?.resumeFile) {
      alert("Resume not available for this applicant");
      return;
    }

    try {
      setDownloadingResumeId(applicant.jobSeeker.jobSeekerId);

      // Extract filename from resumeFile
      // The resumeFile typically looks like "resume14_1765026256889.pdf" or full path
      const resumeFile = applicant.jobSeeker.resumeFile;
      if (!resumeFile) {
        setError("Resume URL not available for this applicant");
        setDownloadingResumeId(null);
        return;
      }
      const fileName = resumeFile.split('/').pop(); // Get the last part after /
      
      console.log("Downloading resume:", fileName);

      const token = getToken();
      
      // Make the API call to download the file
      const response = await fetch(
        `${API_BASE_URL}/api/files/download?fileName=${encodeURIComponent(fileName)}`,
        {
          method: "GET",
          headers: {
            "Authorization": token ? `Bearer ${token}` : undefined,
          },
          credentials: "include",
          mode: "cors"
        }
      );

      if (response.status === 200) {
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link element and trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName; // Use the original filename
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log("Resume downloaded successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to download resume (Status: ${response.status})`);
      }
    } catch (err) {
      console.error("Error downloading resume:", err);
      alert(`Failed to download resume: ${err.message}`);
    } finally {
      setDownloadingResumeId(null);
    }
  };

  // Filter applicants based on selected status
  const filteredApplicants = filterStatus === "all" 
    ? applicants 
    : applicants.filter(app => app.status?.toUpperCase() === filterStatus.toUpperCase());

  if (loading) {
    return (
      <div className="main-container">
        <h2>Loading Applicants...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <h2>Applicants</h2>
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          ✕ {error}
        </div>
        <button onClick={() => navigate("/employer/jobs")} className="primary-btn">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate("/employer/jobs")} style={{ marginRight: "10px" }}>
          ← Back to Jobs
        </button>
      </div>

      {job && (
        <div style={{
          background: '#f0f4ff',
          borderLeft: '4px solid #667eea',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{job.title}</h3>
          <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
            📍 {job.jobLocation} | 📊 {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Status Filter */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button 
          onClick={() => setFilterStatus("all")}
          style={{
            background: filterStatus === "all" ? "#667eea" : "#e0e0e0",
            color: filterStatus === "all" ? "white" : "#333",
            border: "none",
            padding: "8px 16px",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          All ({applicants.length})
        </button>
        {["PENDING", "APPLIED", "REVIEWED", "SHORTLISTED", "REJECTED", "SELECTED"].map(status => {
          const count = applicants.filter(a => a.status?.toUpperCase() === status).length;
          return (
            <button 
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                background: filterStatus === status ? "#667eea" : "#e0e0e0",
                color: filterStatus === status ? "white" : "#333",
                border: "none",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {filteredApplicants.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "#f9f9f9",
          borderRadius: "8px",
          color: "#999"
        }}>
          <p>No applicants with status "{filterStatus}"</p>
        </div>
      ) : (
        <div className="list-table">
          <div className="list-table-header">
            <span>Candidate Name</span>
            <span>Email</span>
            <span>Status</span>
            <span>Applied Date</span>
            <span>Action</span>
          </div>
          {filteredApplicants.map((app) => (
            <div key={app.applicationId || app.id} className="list-table-row">
              <span>
                <strong>{app.user?.name || app.jobSeeker?.firstName || app.candidateName || "N/A"}</strong>
              </span>
              <span>{app.user?.email || app.jobSeeker?.email || "N/A"}</span>
              <span>
                <span className={`status-badge status-${(app.status || 'PENDING').toLowerCase()}`}>
                  {app.status || 'PENDING'}
                </span>
              </span>
              <span>{new Date(app.appliedDate || app.applicationDate || app.createdAt).toLocaleDateString()}</span>
              <span style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleViewApplicantDetails(app)}
                  style={{
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    whiteSpace: "nowrap"
                  }}
                  title="View applicant details and resume"
                >
                  👤 Info
                </button>
                <select
                  value={app.status || 'PENDING'}
                  onChange={(e) => handleStatusUpdate(app.applicationId || app.id, e.target.value)}
                  disabled={updatingId === (app.applicationId || app.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPLIED">Applied</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            maxWidth: "700px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "0",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "24px 30px",
              borderRadius: "12px 12px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "none"
            }}>
              <h2 style={{ margin: 0, color: "white", fontSize: "1.5rem" }}>👤 Applicant Details</h2>
              <button
                onClick={handleCloseApplicantModal}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "6px 12px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "white",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "30px" }}>
              {/* Loading indicator */}
              {loadingApplicantDetails && (
                <div style={{
                  background: "#e3f2fd",
                  border: "1px solid #90caf9",
                  color: "#1976d2",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "20px",
                  textAlign: "center"
                }}>
                  ⏳ Loading applicant details...
                </div>
              )}

              {/* Personal Information */}
              <div style={{
                marginBottom: "24px",
                padding: "20px",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                borderRadius: "10px",
                border: "1px solid #e0e0e0"
              }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#333", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>📋 Personal Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px" }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Full Name</p>
                    <p style={{ margin: 0, color: "#333", fontSize: "1rem", fontWeight: "500" }}>{selectedApplicant.user?.name || selectedApplicant.jobSeeker?.firstName || "N/A"}</p>
                  </div>
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px" }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Email</p>
                    <p style={{ margin: 0, color: "#333", fontSize: "1rem", fontWeight: "500" }}>{selectedApplicant.user?.email || selectedApplicant.jobSeeker?.email || "N/A"}</p>
                  </div>
                 
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px" }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Applied Date</p>
                    <p style={{ margin: 0, color: "#333", fontSize: "1rem", fontWeight: "500" }}>{new Date(selectedApplicant.appliedDate || selectedApplicant.applicationDate || selectedApplicant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Education & Skills
              {selectedApplicant.jobSeeker && (
                <div style={{
                  marginBottom: "24px",
                  padding: "20px",
                  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                  borderRadius: "10px",
                  border: "1px solid #e0e0e0"
                }}>
                  <h3 style={{ margin: "0 0 16px 0", color: "#333", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>🎓 Education & Skills</h3>
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px", marginBottom: "12px" }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Qualifications</p>
                    <p style={{ margin: 0, color: "#333", fontSize: "0.95rem" }}>{selectedApplicant.jobSeeker.qualification || "Not provided"}</p>
                  </div>
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px", marginBottom: "12px" }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Skills</p>
                    <p style={{ margin: 0, color: "#333", fontSize: "0.95rem" }}>{selectedApplicant.jobSeeker.skills || "Not provided"}</p>
                  </div>
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px" }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Experience</p>
                    <p style={{ margin: 0, color: "#333", fontSize: "0.95rem" }}>{selectedApplicant.jobSeeker.yearsOfExperience || "Not provided"} years</p>
                  </div>
                </div>
              )} */}

              {/* Resume Section */}
              {selectedApplicant.jobSeeker ? (
                <div>
                  {selectedApplicant.jobSeeker?.resumeFile ? (
                    <div style={{
                      marginBottom: "24px",
                      padding: "20px",
                      background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                      borderRadius: "10px",
                      border: "2px solid #ff9999"
                    }}>
                      <h3 style={{ margin: "0 0 16px 0", color: "#333", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>📄 Resume</h3>
                      <div style={{ padding: "12px", background: "white", borderRadius: "6px", marginBottom: "12px" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>File Name</p>
                        <p style={{ margin: 0, color: "#333", fontSize: "0.95rem", wordBreak: "break-all" }}>{selectedApplicant.jobSeeker.resumeFile ? selectedApplicant.jobSeeker.resumeFile.split('/').pop() : "N/A"}</p>
                      </div>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleDownloadResume(selectedApplicant)}
                          disabled={downloadingResumeId === (selectedApplicant.jobSeeker?.jobSeekerId || selectedApplicant.jobSeekerId)}
                          style={{
                            display: "inline-block",
                            background: downloadingResumeId === (selectedApplicant.jobSeeker?.jobSeekerId || selectedApplicant.jobSeekerId) ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontWeight: "600",
                            border: "none",
                            cursor: downloadingResumeId === (selectedApplicant.jobSeeker?.jobSeekerId || selectedApplicant.jobSeekerId) ? "not-allowed" : "pointer",
                            opacity: downloadingResumeId === (selectedApplicant.jobSeeker?.jobSeekerId || selectedApplicant.jobSeekerId) ? 0.6 : 1,
                            transition: "all 0.3s ease",
                            fontSize: "0.95rem"
                          }}
                          onMouseEnter={(e) => {
                            if (downloadingResumeId !== selectedApplicant.jobSeekerId) {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          {downloadingResumeId === (selectedApplicant.jobSeeker?.jobSeekerId || selectedApplicant.jobSeekerId) 
                            ? "⏳ Downloading..." 
                            : "⬇️ Download Resume"}
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const token = getToken();
                              const fileName = selectedApplicant.jobSeeker.resumeFile.split('/').pop();
                              
                              // Fetch with proper authorization header
                              const response = await fetch(
                                `${API_BASE_URL}/api/files/download?fileName=${encodeURIComponent(fileName)}`,
                                {
                                  method: "GET",
                                  headers: {
                                    "Authorization": token ? `Bearer ${token}` : undefined,
                                  },
                                  credentials: "include",
                                  mode: "cors"
                                }
                              );

                              if (response.ok) {
                                const blob = await response.blob();
                                const blobUrl = window.URL.createObjectURL(blob);
                                window.open(blobUrl, '_blank');
                                // Clean up the blob URL after a delay
                                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
                              } else {
                                setError("Failed to view resume. Please try downloading instead.");
                              }
                            } catch (err) {
                              console.error("Error viewing resume:", err);
                              setError("Error viewing resume. Please try downloading instead.");
                            }
                          }}
                          style={{
                            display: "inline-block",
                            background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontWeight: "600",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontSize: "0.95rem"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(118, 75, 162, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          👁️ View Resume
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      marginBottom: "24px",
                      padding: "20px",
                      background: "#fff3cd",
                      borderRadius: "10px",
                      border: "1px solid #ffc107"
                    }}>
                      <p style={{ margin: 0, color: "#856404", fontSize: "0.95rem" }}>📄 No resume uploaded</p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Application Status */}
              <div style={{
                marginBottom: "24px",
                padding: "20px",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                borderRadius: "10px",
                border: "1px solid #e0e0e0"
              }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#333", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>📊 Application Status</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span className={`status-badge status-${(selectedApplicant.status || 'PENDING').toLowerCase()}`}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontWeight: "600",
                      fontSize: "0.9rem"
                    }}
                  >
                    {selectedApplicant.status || 'PENDING'}
                  </span>
                  <select
                    value={selectedApplicant.status || 'PENDING'}
                    onChange={(e) => {
                      handleStatusUpdate(selectedApplicant.applicationId, e.target.value);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "2px solid #667eea",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      minWidth: "180px"
                    }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPLIED">Applied</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="SELECTED">Selected</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseApplicantModal}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 20px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#5568d3";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#667eea";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerViewApplicants;