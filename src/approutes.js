// src/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PremiumCheckRoute from "./components/PremiumCheckRoute";
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
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminApplications from "./pages/AdminApplications";
import AdminPremiumUsers from "./pages/AdminPremiumUsers";
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
        <Route path="upgrade" element={<SubscriptionUpgrade />}/>


        {/* Job Seeker Routes */}
        <Route path="jobseeker/profile" element={<ProtectedRoute requiredRole="jobseeker"><JobSeekerProfile /></ProtectedRoute>} />
        <Route path="jobseeker/dashboard" element={<ProtectedRoute requiredRole="jobseeker"><JobSeekerDashboard /></ProtectedRoute>} />
        <Route path="jobseeker/applications" element={<ProtectedRoute requiredRole="jobseeker"><JobSeekerApplications /></ProtectedRoute>} />
        <Route path="jobseeker/saved-jobs" element={<ProtectedRoute requiredRole="jobseeker"><SavedJobs /></ProtectedRoute>} />
        <Route path="apply/:jobId" element={<ProtectedRoute requiredRole="jobseeker"><ApplyJobPage /></ProtectedRoute>} />

        {/* Employer Routes */}
        <Route path="employer/profile" element={<ProtectedRoute requiredRole="employer"><EmployerCompleteProfile /></ProtectedRoute>} />
        <Route path="employer/dashboard" element={<ProtectedRoute requiredRole="employer"><EmployerDashboard /></ProtectedRoute>} />
        <Route path="employer/create-job" element={<ProtectedRoute requiredRole="employer"><EmployerCreateJob /></ProtectedRoute>} />
        <Route path="employer/jobs" element={<ProtectedRoute requiredRole="employer"><EmployerJobList /></ProtectedRoute>} />
        <Route path="employer/applicants/:jobId" element={<ProtectedRoute requiredRole="employer"><EmployerViewApplicants /></ProtectedRoute>} />
        <Route path="employer/pending" element={<ProtectedRoute requiredRole="employer"><EmployerPendingScreen /></ProtectedRoute>} />
        <Route path="employer/rejected" element={<ProtectedRoute requiredRole="employer"><EmployerRejectedScreen /></ProtectedRoute>} />
        <Route path="payment/:subscriptionId" element={<ProtectedRoute requiredRole="employer"><PremiumCheckRoute><PaymentPage /></PremiumCheckRoute></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute requiredRole="ADMIN"><AdminUsers /></ProtectedRoute>} />
        <Route path="admin/jobs" element={<ProtectedRoute requiredRole="ADMIN"><AdminJobs /></ProtectedRoute>} />
        <Route path="admin/payments" element={<ProtectedRoute requiredRole="ADMIN"><AdminPayments /></ProtectedRoute>} />
        <Route path="admin/reports" element={<ProtectedRoute requiredRole="ADMIN"><AdminReports /></ProtectedRoute>} />
        <Route path="admin/subscriptions" element={<ProtectedRoute requiredRole="ADMIN"><AdminSubscriptions /></ProtectedRoute>} />
        <Route path="admin/applications" element={<ProtectedRoute requiredRole="ADMIN"><AdminApplications /></ProtectedRoute>} />
        <Route path="admin/premium-users" element={<ProtectedRoute requiredRole="ADMIN"><AdminPremiumUsers /></ProtectedRoute>} />
        <Route path="admin/company/:employerId" element={<ProtectedRoute requiredRole="ADMIN"><CompanyDetailPage /></ProtectedRoute>} />

      </Route>
    </Routes>
  );
}
