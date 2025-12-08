
import React from "react";
import "../App.css";

export default function EmployerRejectedScreen({setCurrentPage}) {
  return (
    <div className="main-container" style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Status: Rejected</h2>
      <p>Your application is rejected. Please contact admin for more details</p>
      
      {/* <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style> */}
       </div>
  );
}