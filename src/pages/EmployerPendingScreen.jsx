
import React from "react";
import "../App.css";

export default function EmployerPendingScreen({setCurrentPage}) {
  return (
    <div className="main-container" style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Status: Pending</h2>
      <p>Your application is under review. Please wait for approval</p>
      <div className="loader" style={{ marginTop: "20px" }}>
        {/* Simple CSS loader */}
        {/* <div
          style={{
            border: "6px solid #f3f3f3",
            borderTop: "6px solid #3498db",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
            margin: "auto",
          }}
        ></div> */}
      </div>
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