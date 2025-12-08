import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import BackToDashboardButton from "../components/BackToDashboardButton";
import "../App.css";

function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    planType: "",
    duration: "",
    price: "",
    userType: ""
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/admins/subscriptions`);
      
      if (response.status === 200) {
        const json = await response.json();
        const subs = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        console.log("Subscriptions fetched:", subs.length);
        setSubscriptions(subs);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch subscriptions:", response.status, errorText);
        setSubscriptions([]);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subscription) => {
    setEditingId(subscription.subscriptionId);
    setEditForm({
      planType: subscription.planType || "",
      duration: subscription.duration || "",
      price: subscription.price || "",
      userType: subscription.userType || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      planType: "",
      duration: "",
      price: "",
      userType: ""
    });
  };

  const handleSaveEdit = async (subscriptionId) => {
    try {
      const response = await apiFetch(`/api/admins/subscriptions/${subscriptionId}`, {
        method: "PUT",
        body: JSON.stringify(editForm)
      });

      if (response.status === 200) {
        alert("Subscription updated successfully");
        await fetchSubscriptions();
        handleCancelEdit();
      } else {
        alert("Failed to update subscription");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Error updating subscription");
    }
  };

  return (
    <div className="main-container">
      <BackToDashboardButton />
      <h2>💳 Subscription Plans Management</h2>
      <p className="section-subtitle">Manage subscription plans for employers and job seekers</p>

      {loading ? (
        <p>Loading subscriptions...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "12px" }}>ID</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Plan Type</th>
                <th style={{ textAlign: "left", padding: "12px" }}>User Type</th>
                <th style={{ textAlign: "right", padding: "12px" }}>Duration (days)</th>
                <th style={{ textAlign: "right", padding: "12px" }}>Price (₹)</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <tr key={sub.subscriptionId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    {editingId === sub.subscriptionId ? (
                      <>
                        <td style={{ padding: "12px" }}>{sub.subscriptionId}</td>
                        <td style={{ padding: "12px" }}>
                          <input
                            type="text"
                            value={editForm.planType}
                            onChange={(e) => setEditForm({ ...editForm, planType: e.target.value })}
                            style={{
                              padding: "6px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              width: "100%"
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px" }}>
                          <select
                            value={editForm.userType}
                            onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                            style={{
                              padding: "6px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              width: "100%"
                            }}
                          >
                            <option value="">Select User Type</option>
                            <option value="EMPLOYER">EMPLOYER</option>
                            <option value="JOB_SEEKER">JOB_SEEKER</option>
                          </select>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <input
                            type="number"
                            value={editForm.duration}
                            onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                            style={{
                              padding: "6px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              width: "100%"
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px" }}>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            style={{
                              padding: "6px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              width: "100%"
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button
                              onClick={() => handleSaveEdit(sub.subscriptionId)}
                              style={{
                                padding: "6px 12px",
                                background: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.85rem"
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                padding: "6px 12px",
                                background: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.85rem"
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "12px" }}>{sub.subscriptionId}</td>
                        <td style={{ padding: "12px", fontWeight: "500" }}>{sub.planType || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            background: sub.userType === "EMPLOYER" ? "#e3f2fd" : "#f3e5f5",
                            color: sub.userType === "EMPLOYER" ? "#1976d2" : "#7b1fa2"
                          }}>
                            {sub.userType || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>{sub.duration || "N/A"}</td>
                        <td style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                          ₹{sub.price ? parseFloat(sub.price).toLocaleString() : "0"}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleEdit(sub)}
                            style={{
                              padding: "6px 12px",
                              background: "#667eea",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.85rem"
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr key="no-subscriptions">
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                    No subscription plans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminSubscriptions;

