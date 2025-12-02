import React from "react";
import { apiFetch } from "../api";

function SubscriptionUpgrade({ user }) {

  const upgrade = async () => {
    await apiFetch("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        subscriptionType: "PREMIUM",
        userId: user.userId
      })
    });

    alert("Upgraded! Logout and login again.");
  };

  return (
    <div className="main-container">
      <h2>Upgrade to Premium</h2>
      <p>Unlock skill match, unlimited postings (employer), recommendations.</p>
      <button onClick={upgrade}>Upgrade</button>
    </div>
  );
}

export default SubscriptionUpgrade;