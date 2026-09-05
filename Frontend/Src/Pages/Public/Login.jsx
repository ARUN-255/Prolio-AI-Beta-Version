import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../Context/AuthContext";
import { loginUser } from "../../Services/authService";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.identifier.trim() || !formData.password) {
      setError("Enter your email or phone number and password.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const data = await loginUser({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      const token = data?.token;
      const user = data?.user;

      if (!token || !user) {
        throw new Error("Invalid login response.");
      }

      login(token, user);

      if (user.role === "recruiter") {
        navigate("/recruiter/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to log in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <Link className="auth-brand" to="/">
            <span className="brand-mark">P</span>
            <span>
              Prolio <strong>AI</strong>
            </span>
          </Link>

          <div className="auth-heading">
            <h1>Welcome back</h1>
            <p>Log in to continue to your Prolio account.</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="identifier">Email or phone number</label>

              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter email or phone number"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              className="button button-primary auth-submit"
              type="submit"
              disabled={submitting}
            >
              <LogIn size={18} />

              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create account</Link>
          </p>

          <Link className="auth-home-link" to="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Login;