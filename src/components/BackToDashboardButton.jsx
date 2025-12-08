import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackToDashboardButton() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
      <button
        onClick={() => navigate("/admin/dashboard")}
        style={{
          padding: "8px 16px",
          background: "#667eea",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.9rem",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "transform 0.2s ease, background 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.background = "#5568d3";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.background = "#667eea";
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

