// src/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import JobSeekerProfile from "./pages/JobSeekerProfile";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import EmployerCompleteProfile from "./pages/EmployerCompleteProfile";

// Job Seeker Pages
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import JobSeekerApplications from "./pages/JobSeekerApplications";
import SavedJobs from "./pages/SavedJobs";
import ApplyJobPage from "./pages/ApplyJobPage";

// Employer Pages
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerCreateJob from "./pages/EmployerCreateJob";
import EmployerJobList from "./pages/EmployerJobList";
import EmployerViewApplicants from "./pages/EmployerViewApplicants";
import EmployerPendingScreen from "./pages/EmployerPendingScreen";
import EmployerRejectedScreen from "./pages/EmployerRejectedScreen";
import SubscriptionUpgrade from "./pages/SubscriptionUpgrade";
import PaymentPage from "./pages/PaymentPage";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminJobs from "./pages/AdminJobs";
import AdminPayments from "./pages/AdminPayments";
import AdminReports from "./pages/AdminReports";
import CompanyDetailPage from "./pages/CompanyDetailPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Layout wraps Navbar + Footer around all pages */}
      <Route path="/" element={<Layout />}>
        
        {/* Home & Auth */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Public Job Routes */}
        <Route path="jobs" element={<JobsPage />} />
        <Route path="job/:jobId" element={<JobDetailPage />} />

        {/* Job Seeker Routes */}
        <Route path="jobseeker/profile" element={<JobSeekerProfile />} />
        <Route path="jobseeker/dashboard" element={<JobSeekerDashboard />} />
        <Route path="jobseeker/applications" element={<JobSeekerApplications />} />
        <Route path="jobseeker/saved-jobs" element={<SavedJobs />} />
        <Route path="apply/:jobId" element={<ApplyJobPage />} />

        {/* Employer Routes */}
        <Route path="employer/profile" element={<EmployerCompleteProfile />} />
        <Route path="employer/dashboard" element={<EmployerDashboard />} />
        <Route path="employer/create-job" element={<EmployerCreateJob />} />
        <Route path="employer/jobs" element={<EmployerJobList />} />
        <Route path="employer/applicants/:jobId" element={<EmployerViewApplicants />} />
        <Route path="employer/pending" element={<EmployerPendingScreen />} />
        <Route path="employer/rejected" element={<EmployerRejectedScreen />} />
        <Route path="employer/upgrade" element={<SubscriptionUpgrade />} />
        <Route path="payment/:subscriptionId" element={<PaymentPage />} />

        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/jobs" element={<AdminJobs />} />
        <Route path="admin/payments" element={<AdminPayments />} />
        <Route path="admin/reports" element={<AdminReports />} />
        <Route path="admin/company/:employerId" element={<CompanyDetailPage />} />

      </Route>
    </Routes>
  );
}
