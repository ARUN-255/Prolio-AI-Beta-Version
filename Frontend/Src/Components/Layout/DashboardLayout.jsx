import {
  BriefcaseBusiness,
  FileCheck2,
  FileText,
  Home,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../Context/AuthContext";

const studentNavigation = [
  {
    label: "Dashboard",
    to: "/student/dashboard",
    icon: Home,
  },
  {
    label: "Portfolio",
    to: "/student/portfolio",
    icon: UserRound,
  },
  {
    label: "Resumes",
    to: "/student/resumes",
    icon: FileText,
  },
  {
    label: "ATS Checker",
    to: "/student/ats",
    icon: FileCheck2,
  },
];

const recruiterNavigation = [
  {
    label: "Dashboard",
    to: "/recruiter/dashboard",
    icon: Home,
  },
  {
    label: "Candidates",
    to: "/recruiter/candidates",
    icon: UserRound,
  },
  {
    label: "Resume Comparison",
    to: "/recruiter/compare",
    icon: FileCheck2,
  },
  {
    label: "Jobs",
    to: "/recruiter/jobs",
    icon: BriefcaseBusiness,
  },
];

function DashboardLayout() {
  const navigate = useNavigate();

  const {
    user,
    logout,
    isStudent,
    isRecruiter,
  } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = isStudent
    ? studentNavigation
    : isRecruiter
      ? recruiterNavigation
      : [];

  const dashboardPath = isRecruiter
    ? "/recruiter/dashboard"
    : "/student/dashboard";

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="dashboard-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "is-open" : ""
        }`}
      >
        <div className="dashboard-sidebar-top">
          <Link
            className="dashboard-brand"
            to={dashboardPath}
            onClick={closeSidebar}
          >
            <span className="brand-mark">P</span>

            <span>
              Prolio <strong>AI</strong>
            </span>
          </Link>

          <button
            type="button"
            className="dashboard-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        <nav
          className="dashboard-navigation"
          aria-label="Dashboard navigation"
        >
          {navigation.map(
            ({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `dashboard-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon size={19} />

                <span>{label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-user">
            <div className="dashboard-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="dashboard-user-info">
              <strong>{user?.name || "User"}</strong>

              <span>
                {isRecruiter ? "Recruiter" : "Student"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />

            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <button
            type="button"
            className="dashboard-menu-button"
            onClick={() =>
              setSidebarOpen((current) => !current)
            }
            aria-label="Open navigation"
          >
            <Menu size={23} />
          </button>

          <div className="dashboard-header-title">
            <span>
              {isRecruiter
                ? "Recruiter Workspace"
                : "Student Workspace"}
            </span>
          </div>

          <div className="dashboard-header-user">
            <span>{user?.name || "User"}</span>

            <div className="dashboard-header-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;