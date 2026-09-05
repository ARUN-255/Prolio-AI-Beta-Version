import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Add JWT token automatically to authenticated requests.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("prolio_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
 * Handle authentication errors returned by the backend.
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("prolio_token");
      localStorage.removeItem("prolio_user");

      /*
       * Do not redirect when the user is already trying
       * to log in or register.
       */
      const publicAuthPages = ["/login", "/register"];

      if (!publicAuthPages.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;