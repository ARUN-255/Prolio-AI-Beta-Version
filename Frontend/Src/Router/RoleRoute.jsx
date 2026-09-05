import { Navigate } from "react-router-dom";

import { useAuth } from "../Context/AuthContext";

function RoleRoute({ children, allowedRole }) {
  const { user, isAuthenticated, loading } = useAuth();

  /*
   * Wait until the stored authentication
   * information has been restored.
   */
  if (loading) {
    return (
      <main className="route-loading">
        <p>Loading...</p>
      </main>
    );
  }

  /*
   * User is not logged in.
   */
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  /*
   * User is logged in but trying to access
   * a page belonging to another role.
   */
  if (user.role !== allowedRole) {
    if (user.role === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }

    if (user.role === "recruiter") {
      return <Navigate to="/recruiter/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;