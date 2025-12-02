// src/App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerCreateJob from "./pages/EmployerCreateJob";
import JobSeekerProfile from "./pages/JobSeekerProfile";
import EmployerCompanyProfile from "./pages/EmployerCompleteProfile";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import CompanyCompleteProfile from "./pages/CompanyProfile";
import EmployerPendingScreen from "./pages/EmployerPendingScreen";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import JobDetailPage from "./pages/JobDetailPage";
import EmployerRejectedScreen from "./pages/EmployerRejectedScreen";
import ApplyJobPage from "./pages/ApplyJobPage";


function App() {
  // which screen should be shown when NO user is logged in
  const [currentPage, setCurrentPage] = useState("home");
const [currentEmployer,setCurrentEmployer] = useState(null);
  // logged-in user (ADMIN / EMPLOYER / JOB_SEEKER)
  const [user, setUser] = useState(null);
  const [currentJob, setCurrentJob] = useState(null);
  const [employerId, setEmployerId] = useState(null);
  const [jobSeeker, setJobSeeker] = useState(null);

  

  // when app loads, try to restore user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

 
const handleEmployeerProfileSuccess =(employerData) =>{
setEmployerId(employerData);
console.log(employerData);
localStorage.setItem("employerId", JSON.stringify(employerData));
}

  // called by LoginPage when backend login is successful
  const handleLoginSuccess = (userData, token) => {

    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("token", token);
      console.log(token);
    }
    // we don’t need to manually change currentPage:
    // once user is set, dashboards will be shown automatically
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setCurrentPage("home"); // go back to landing page
  };

  // Decide what goes into the main area
  const renderPage = () => {
    // 🔹 NO USER LOGGED IN – show normal pages
    if (!user) {
      if (currentPage === "login") {
        return <LoginPage setUser={setUser} onLoginSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} setJobSeeker={setJobSeeker} />;
      }
      if (currentPage === "register") {
        return <RegisterPage />;
      }
      if (currentPage === "jobs") {
        return <JobsPage />;
      }
      // default
      return <HomePage />;
    }
  
   if(user.userType === "JOB_SEEKER"){

    if (currentPage === "completeProfile") {

      return <JobSeekerProfile user={user} setCurrentPage={setCurrentPage} />;
    }

    if(currentPage === "jobDetail"){
      return <JobDetailPage job = {currentJob} setCurrentPage={setCurrentPage}/>;
    }
    if(currentPage === "jobseekerDashboard")
    return <JobSeekerDashboard user={user} setCurrentPage={setCurrentPage} setCurrentJob={setCurrentJob} />;

    if(currentPage === "applyJob"){
      return <ApplyJobPage  job={currentJob} jobSeeker={jobSeeker} setCurrentPage={setCurrentPage} />
    }
   }


   if(user.userType === "EMPLOYER"){
    if ( currentPage === "AddJob") {
      return <EmployerCreateJob user={user} setCurrentPage={setCurrentPage} />;
    }
    if(currentPage ==="empProfile"){
      return <EmployerCompanyProfile user={user} setCurrentPage={setCurrentPage} employeerProfileSuccess={handleEmployeerProfileSuccess} />;
    }
    if(currentPage ==="pendingScreen"){
      return <EmployerPendingScreen  setCurrentPage={setCurrentPage}  />;
    }
    if(currentPage ==="rejectedScreen"){
      return <EmployerRejectedScreen  setCurrentPage={setCurrentPage}  />;
    }
    if(currentPage ==="empDashboard"){
    return <EmployerDashboard user={user} setCurrentPage={setCurrentPage} />;
  }
   }
    
   // 🔹 USER LOGGED IN – send to correct dashboard
    if (user.userType === "ADMIN") {
      if(currentPage=== "admDashboard"){
      return <AdminDashboard setCurrentEmployer={setCurrentEmployer} setCurrentPage={setCurrentPage}/>;}
      if(currentPage === "companyDetail"){
        return <CompanyDetailPage employer ={currentEmployer} setCurrentPage={setCurrentPage} />
      }

    }

    return <HomePage />;
  };

  return (
    <div className="app-root">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />

      <main className="app-main">{renderPage()}</main>

      <Footer />
    </div>
  );
}

export default App;