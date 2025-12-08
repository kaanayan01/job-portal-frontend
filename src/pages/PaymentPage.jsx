import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiFetch, getToken } from "../api";
import { useReduxUser } from "../hooks/useReduxUser";
import { useNavigate, useParams } from "react-router-dom";
import { setJobSeeker } from "../store/jobSeekerSlice";
import { setEmployer } from "../store/employerSlice";
import "./PaymentPage.css";

export default function PaymentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
  const reduxUser = useReduxUser();
  const jobSeeker = useSelector(state => state.jobSeeker?.jobSeeker);
  const employer = useSelector(state => state.employer?.employer);
  const userId = reduxUser?.userId;
  const userType = reduxUser?.userType;

  // Subscription and Payment State
  const [subscription, setSubscription] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "RAZORPAY",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingSubscription, setFetchingSubscription] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  // Get privileges based on user type and plan type
  const getPrivileges = (planType) => {
    if (userType === "JOB_SEEKER") {
      if (planType === "PREMIUM") {
        return [
          "Unlimited job applications per day",
          "Skill match analysis",
          "Premium job listings access"
        ];
      } else {
        return [
          "5 job applications per day",
          "Basic job search"
        ];
      }
    } else if (userType === "EMPLOYER") {
      if (planType === "PREMIUM") {
        return [
          "Unlimited job posts per day",
          "Advanced job listings",
          "Analytics and insights"
        ];
      } else {
        return [
          "5 job posts per day",
          "Basic job posting"
        ];
      }
    }
    return [];
  };

  // Fetch subscription details on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!subscriptionId) {
        setError("Subscription ID not found in route.");
        return;
      }

      setFetchingSubscription(true);
      setError("");

      try {
        const token = getToken();
        const res = await apiFetch(`/api/subscriptions/${subscriptionId}`, {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        const responseData = await res.json();
        console.log("Subscription Response:", responseData);

        if (res.status === 200 && responseData.data) {
          const subData = responseData.data;
          // Validate userType matches
          if (subData.userType !== userType) {
            setError(
              `This subscription is for ${subData.userType} users, but you are a ${userType}.`
            );
            return;
          }
          setSubscription(subData);
        } else {
          setError(
            responseData.message || "Failed to fetch subscription details"
          );
        }
      } catch (err) {
        console.error("Subscription fetch error:", err);
        setError("Failed to load subscription details. Please try again.");
      } finally {
        setFetchingSubscription(false);
      }
    };

    fetchSubscription();
  }, [subscriptionId, userType]);

  // Validate user on mount
  useEffect(() => {
    if (!userId) {
      setError("User ID not found. Please login first.");
    }
  }, [userId]);

  // Payment Handler - Only for paymentMethod
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!userId) {
      setError("User ID not found. Please login first.");
      setLoading(false);
      return;
    }

    if (!subscription) {
      setError("Subscription data not loaded. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      // Build payment data with subscription details from backend
      const paymentData = {
        userId: userId,
        subscriptionId: parseInt(subscriptionId),
        amount: subscription.price, // Amount from subscription
        paymentMethod: paymentForm.paymentMethod,
        orderId: `ORD${Date.now()}`, // Auto-generated
        transactionId: `TXN${Date.now()}`, 
        status :"PENDING"// Auto-generated
      };

      console.log("Submitting payment:", paymentData);

      const res = await apiFetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(paymentData),
      });

      const responseData = await res.json();
      console.log("Payment Response:", responseData);

      if (res.status === 200 || res.status === 201) {
        // Extract payment ID from response
        const extractedPaymentId = responseData.data?.paymentId || responseData.data?.id;
        setPaymentId(extractedPaymentId);

        setMessage(
          `✓ Payment created! Transaction ID: ${paymentData.transactionId}`
        );
        setShowConfirmation(true);
      } else {
        setError(
          responseData.message || `Payment failed with status ${res.status}`
        );
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRedirect = () => {
    setShowConfirmation(false);
    navigate("/employer/dashboard");
  };

  const handleCancelRedirect = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setError("");
    setMessage("");

    if (!paymentId) {
      console.error("Payment ID not found");
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      
      // Step 1: Call POST to process payment
      const processRes = await apiFetch(`/api/payments/${paymentId}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const processData = await processRes.json();
      console.log("Payment processing response:", processData);

      let updateStatus = "FAILURE";
      
      // Step 2: If process payment is success, update status to SUCCESS; otherwise FAILURE
      if (processRes.status === 200 || processRes.status === 201) {
        console.log("Payment processed successfully:", processData.data);
        updateStatus = "SUCCESS";
      } else {
        console.error("Payment processing failed:", processData.message);
        updateStatus = "FAILED";
      }

      // Step 3: Update payment status using PUT
      const updatePaymentData = {
        userId: userId,
        subscriptionId: parseInt(subscriptionId),
        amount: subscription?.price,
        paymentMethod: paymentForm.paymentMethod,
        status: updateStatus,
        paymentDate : new Date().toISOString()

      };
      console.log("Updating payment status to:", updatePaymentData);

      const updateRes = await apiFetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(updatePaymentData),
      });

      const updateData = await updateRes.json();
      console.log("Payment update response:", updateData);

      if (updateRes.status === 200 || updateRes.status === 201) {
        if (updateStatus === "SUCCESS") {
          // Update Redux with premium status
          if (userType === "JOB_SEEKER" && jobSeeker) {
            dispatch(setJobSeeker({
              ...jobSeeker,
              subscriptionType: "PREMIUM"
            }));
          } else if (userType === "EMPLOYER" && employer) {
            dispatch(setEmployer({
              ...employer,
              subscriptionType: "PREMIUM"
            }));
          }

          setMessage("✓ Payment processed successfully!");
          // Redirect to appropriate page based on user type after 2 seconds
          setTimeout(() => {
            if (userType === "EMPLOYER") {
              navigate("/employer/jobs");
            } else if (userType === "JOB_SEEKER") {
              navigate("/jobs");
            } else {
              navigate("/");
            }
          }, 2000);
        } else {
          setError("✕ Payment processing failed. Please try again.");
        }
        console.log(`Payment status updated to ${updateStatus}:`, updateData.data);
      } else {
        console.error("Payment status update failed:", updateData.message);
        setError("Failed to update payment status.");
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError("An error occurred during payment processing.");
    } finally {
      setLoading(false);
      // Reset form for new transaction only on success
      if (!error) {
        setPaymentForm({ paymentMethod: "RAZORPAY" });
      }
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h1>Process Payment</h1>
          <p>Complete your payment securely</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error">
            <span>✕</span> {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            <span>✓</span> {message}
          </div>
        )}

        {/* Loading State */}
        {fetchingSubscription && (
          <div className="alert alert-info">
            <span>ℹ</span> Loading subscription details...
          </div>
        )}

        {/* Subscription Details */}
        {subscription && !fetchingSubscription && (
          <div className="subscription-details">
            <h3>Subscription Details</h3>
            <div className="detail-row">
              <span className="detail-label">Plan Type:</span>
              <span className="detail-value">{subscription.planType}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{subscription.duration} days</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Amount:</span>
              <span className="detail-value amount">${subscription.price}</span>
            </div>

            {/* Privileges Section */}
            <div className="privileges-container">
              <h4 className="privileges-header">What you'll get:</h4>
              <ul className="privileges-list">
                {getPrivileges(subscription.planType).map((privilege, index) => (
                  <li key={index} className="privilege-item">
                    <span className="privilege-icon">✓</span>
                    <span className="privilege-text">{privilege}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Payment Form - Only paymentMethod selection */}
        {subscription && !fetchingSubscription && (
          <form onSubmit={submitPayment} className="payment-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="paymentMethod">Select Payment Method *</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={paymentForm.paymentMethod}
                  onChange={handlePaymentChange}
                  className="form-select"
                >
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Credit/Debit Card</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading || !userId || !subscription}
                className="submit-btn"
              >
                {loading ? "Processing..." : `Pay $${subscription.price}`}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h2>✓ Payment Gateway</h2>
              </div>

              <div className="modal-body">
                <p className="confirmation-message">
                  Please continue to process your payment. Below are the details of your transaction:
                </p>
                <div className="transaction-details">
            
                  <div className="detail-item">
                    <span className="label">Subscription:</span>
                    <span className="value">{subscription?.planType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value">${subscription?.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration:</span>
                    <span className="value">{subscription?.duration} days</span>
                  </div>
                </div>

                <p className="confirmation-note">
                  You will be redirected to your dashboard. Click below to proceed now.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="modal-btn modal-primary"
                  onClick={handleConfirmRedirect}
                >
                  Go to Dashboard
                </button>
                <button
                  className="modal-btn modal-secondary"
                  onClick={handleCancelRedirect}
                >
                  Continue Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
