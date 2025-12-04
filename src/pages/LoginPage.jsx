// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { apiFetch, setToken } from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LoginPage({ onLogin ,setCurrentPage,setUser,setJobSeeker}) {
  const goToJobSeeker = () => setCurrentPage("jobseekerDashboard");
  const goToJobSeekerCompleteProfile = () => setCurrentPage("completeProfile");
  const goToPendingScreen = () => setCurrentPage("pendingScreen");
  const goToRejectedScreen = () => setCurrentPage("rejectedScreen");
  const gotoEmployerDashboard = ()=> setCurrentPage("empDashboard");
  const gotoEmployerProfile = ()=> setCurrentPage("empProfile");
  const gotoAdminDashboard = ()=> setCurrentPage("admDashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUserInJobSeeker, setUserInJobSeeker] = useState(null);
  const checkJobSeeker  = async (id,token) => {
    try {
    
      const res = await apiFetch(`/api/jobseekers/checkuser/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },

      });
  
      const json = await res.json();
      
  
      if (json.status !== "success" && json.status !== 200) {
        setError(json.message || "Invalid login");
        return;
      }
  
      const data = json.data || {};
  console.log(data);
    
    
 
if (data.jobSeekerId === 0) {

  goToJobSeekerCompleteProfile();
}

  else{
    setJobSeeker(data);
    goToJobSeeker();
  }
      
    } catch (err) {
 
      setError("Server error");
      goToJobSeekerCompleteProfile();
    }
  };


  const checkEmployer  = async (id,token) => {

    try {
      
      const res = await apiFetch(`/api/employers/checkuser/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },

      });
  
      const json = await res.json();
      
  
      if (json.status !== "success" && json.status !== 200) {
        setError(json.message || "Invalid login");
        return;
      }
  
      const data = json.data || {};
  console.log(data);
    
 
if (data.employerId === 0) {
  gotoEmployerProfile();

  
}
else if(data.approvalStatus === "PENDING"){
  goToPendingScreen();
}

else if (data.approvalStatus === "APPROVED"){
  gotoEmployerDashboard();
}
else if(data.approvalStatus === "REJECTED"){
  goToRejectedScreen();
}

  else{

    gotoEmployerDashboard();
  }
      
    } catch (err) {
      console.error("-----------------Error in check fun:", err);
      setError("Server error");
      goToJobSeekerCompleteProfile();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {

      const res = await apiFetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();


      if (json.status !== "success" && json.status !== 200) {
        setError(json.message || "Invalid login");
        return;
      }


      const data = json.data || {};

      // Try to get token from common field names
      const token = data.token || data.jwtToken || data.jwt || null;
      if (token) {
        setToken(token);
      }

      // Build a user object regardless of exact backend shape
        const user =
        data.user || {
          userId: data.userId,
          id: data.userId,
          email: data.email,
          name: data.name,
          userType: data.userType,
          status: data.status,
        };

   

        if(user.userType === "JOB_SEEKER"){
          console.log("in job_seeker");
        await checkJobSeeker(user.userId,token);
        }
       else if(user.userType === "EMPLOYER"){
          await checkEmployer(user.userId,token);
          }
        else if (user.userType === "ADMIN") {
          gotoAdminDashboard();
        }


        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
   

      if (!user || !user.userType) {
        setError("Could not determine user details from response");
        return;
      }
     
      // Inform App.jsx that login succeeded
      if (onLogin) {
      
        onLogin(user);
      }

      setMessage("Login successful");
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error");
    }
  };
  const handleLogout = () => {
    console.log("logging out");
  }

  return (
    <div className="app-root">
     
    <div style={{ padding: "3rem 2rem" }}>
      <h1>Login</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={submit}>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <button type="submit">Login</button>
      </form>
    </div>
    {/* <Footer/> */}
    </div>
  );
}

export default LoginPage;
