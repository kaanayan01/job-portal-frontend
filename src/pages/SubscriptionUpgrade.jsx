import React, { useState, useEffect } from "react";
import { apiFetch, getToken } from "../api";
import { useReduxUser } from "../hooks/useReduxUser";
import { useNavigate } from "react-router-dom";
import "./SubscriptionUpgrade.css";

export default function SubscriptionUpgrade() {
  const navigate = useNavigate();
  const reduxUser = useReduxUser();
  const userType = reduxUser?.userType;

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // Fetch subscriptions by user type on mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!userType) {
        setError("User type not found. Please login first.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const token = getToken();
        const res = await apiFetch(`/api/subscriptions/userType/${userType}`, {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        const responseData = await res.json();
        console.log("Subscriptions Response:", responseData);

        if (res.status === 200 && responseData.data) {
          setSubscriptions(responseData.data);
          if (responseData.data.length > 0) {
            setSelectedSubscription(responseData.data[0].subscriptionId);
          }
        } else {
          setError(
            responseData.message || "Failed to fetch subscriptions"
          );
        }
      } catch (err) {
        console.error("Subscription fetch error:", err);
        setError("Failed to load subscriptions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userType]);

  const handleSelectSubscription = (subscriptionId) => {
    setSelectedSubscription(subscriptionId);
  };

  const handleProceedToPayment = () => {
    if (!selectedSubscription) {
      setError("Please select a subscription plan.");
      return;
    }
    navigate(`/payment/${selectedSubscription}`);
  };

  return (
    <div className="subscription-upgrade-container">
      <div className="upgrade-header">
        <h1>Choose Your Plan</h1>
        <p>Select a subscription plan to upgrade your account</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <span>✕</span> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="alert alert-info">
          <span>ℹ</span> Loading subscription plans...
        </div>
      )}

      {/* Subscriptions Grid */}
      {!loading && subscriptions.length > 0 && (
        <div className="subscriptions-grid">
          {subscriptions.map((sub) => (
            <div
              key={sub.subscriptionId}
              className={`subscription-card ${
                selectedSubscription === sub.subscriptionId ? "selected" : ""
              }`}
              onClick={() => handleSelectSubscription(sub.subscriptionId)}
            >
              <div className="card-header">
                <h3>{sub.planType}</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">{sub.price}</span>
                </div>
              </div>

              <div className="card-body">
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">
                    {sub.duration} days access
                  </span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">
                    {sub.userType} privileges
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button
                  className={`select-btn ${
                    selectedSubscription === sub.subscriptionId
                      ? "selected"
                      : ""
                  }`}
                >
                  {selectedSubscription === sub.subscriptionId
                    ? "✓ Selected"
                    : "Select"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Subscriptions Message */}
      {!loading && subscriptions.length === 0 && !error && (
        <div className="alert alert-warning">
          <span>!</span> No subscription plans available for your user type.
        </div>
      )}

      {/* Action Buttons */}
      {subscriptions.length > 0 && (
        <div className="action-buttons">
          <button
            className="proceed-btn"
            onClick={handleProceedToPayment}
            disabled={!selectedSubscription || loading}
          >
            Proceed to Payment
          </button>
          <button
            className="cancel-btn"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}