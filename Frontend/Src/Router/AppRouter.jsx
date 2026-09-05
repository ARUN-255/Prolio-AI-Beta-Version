import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../Components/Layout/DashboardLayout";
import HomePage from "../Pages/Home/HomePage";
import Login from "../Pages/Public/Login";
import Signup from "../Pages/Public/Signup";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import StudentDashboard from "../Pages/Student/Dashboard";
import PortfolioMaker from "../Pages/Student/PortfolioMaker";
import AddProject from "../Pages/Student/AddProject";
import AddSkill from "../Pages/Student/AddSkill";

function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <p className="eyebrow">Prolio AI</p>
      <h1>{title}</h1>
      <p>This page will be completed in its dedicated frontend step.</p>
    </div>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/features" element={<PlaceholderPage title="Features" />} />
      <Route path="/students" element={<PlaceholderPage title="For Students" />} />
      <Route path="/recruiters" element={<PlaceholderPage title="For Recruiters" />} />
      <Route path="/pricing" element={<PlaceholderPage title="Pricing" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="student">
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="portfolio" element={<PortfolioMaker />} />
        <Route path="portfolio/project/add" element={<AddProject />} />
        <Route path="portfolio/skill/add" element={<AddSkill />} />
        <Route path="resumes" element={<PlaceholderPage title="Resumes" />} />
        <Route path="ats" element={<PlaceholderPage title="ATS Checker" />} />
      </Route>

      <Route
        path="/recruiter"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="recruiter">
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PlaceholderPage title="Recruiter Dashboard" />} />
        <Route path="candidates" element={<PlaceholderPage title="Candidates" />} />
        <Route path="compare" element={<PlaceholderPage title="Resume Comparison" />} />
        <Route path="jobs" element={<PlaceholderPage title="Jobs" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
