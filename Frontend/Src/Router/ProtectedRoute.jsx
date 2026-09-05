import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../Context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  /*
   * Wait until AuthContext has checked localStorage.
   * This prevents redirecting a logged-in user while
   * the session is still being restored.
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
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;