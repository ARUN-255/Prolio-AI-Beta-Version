import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getStoredUser,
  getToken,
  logoutUser,
  saveAuthData,
} from "../Services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Restore login information when the app starts.
   */
  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  /*
   * Called after a successful login.
   */
  const login = (token, userData) => {
    saveAuthData(token, userData);
    setUser(userData);
  };

  /*
   * Log the current user out.
   */
  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const isAuthenticated = Boolean(user && getToken());

  const isStudent = user?.role === "student";
  const isRecruiter = user?.role === "recruiter";

  const value = {
    user,
    loading,
    isAuthenticated,
    isStudent,
    isRecruiter,
    login,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}

export default AuthContext;