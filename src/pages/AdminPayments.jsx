import React from "react";
import "../App.css";

const DUMMY_PAYMENTS = [
  { id: 1, payer: "TechNova Labs", amount: "₹4,999", status: "SUCCESS" },
  { id: 2, payer: "InsightWorks", amount: "₹1,999", status: "PENDING" },
];

function AdminPayments() {
  return (
    <div className="main-container">
      <h2>Payments</h2>
      <p className="section-subtitle">
        To be connected with Payment & Subscription tables (e.g., Razorpay data).
      </p>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">₹6,998</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Subscriptions</div>
          <div className="metric-value">3</div>
        </div>
      </div>

      <div className="section">
        <div className="list-table">
          <div className="list-table-header">
            <span>Payer</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {DUMMY_PAYMENTS.map((p) => (
            <div key={p.id} className="list-table-row">
              <span>{p.payer}</span>
              <span>{p.amount}</span>
              <span>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPayments;