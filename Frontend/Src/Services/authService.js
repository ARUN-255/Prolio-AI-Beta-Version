import api from "./api";

/*
 * Register a new user.
 */
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

/*
 * Login using email/phone and password.
 */
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

/*
 * Save authentication data after successful login.
 */
export const saveAuthData = (token, user) => {
  if (token) {
    localStorage.setItem("prolio_token", token);
  }

  if (user) {
    localStorage.setItem("prolio_user", JSON.stringify(user));
  }
};

/*
 * Get the currently stored JWT.
 */
export const getToken = () => {
  return localStorage.getItem("prolio_token");
};

/*
 * Get the currently stored user.
 */
export const getStoredUser = () => {
  const user = localStorage.getItem("prolio_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("prolio_user");
    return null;
  }
};

/*
 * Check whether a token exists locally.
 */
export const isAuthenticated = () => {
  return Boolean(getToken());
};

/*
 * Remove authentication data.
 */
export const logoutUser = () => {
  localStorage.removeItem("prolio_token");
  localStorage.removeItem("prolio_user");
};