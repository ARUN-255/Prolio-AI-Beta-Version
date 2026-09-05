import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../Context/AuthContext";
import { registerUser } from "../../Services/authService";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
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

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name) {
      setError("Enter your name.");
      return;
    }

    if (!email && !phone) {
      setError("Enter an email address or phone number.");
      return;
    }

    if (!formData.password) {
      setError("Enter a password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const data = await registerUser({
        name,
        email: email || null,
        phone: phone || null,
        password: formData.password,
        role: formData.role,
      });

      if (!data?.token || !data?.user) {
        throw new Error("Invalid registration response.");
      }

      login(data.token, data.user);

      if (data.user.role === "recruiter") {
        navigate("/recruiter/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card auth-card-wide">
          <Link className="auth-brand" to="/">
            <span className="brand-mark">P</span>
            <span>
              Prolio <strong>AI</strong>
            </span>
          </Link>

          <div className="auth-heading">
            <h1>Create your account</h1>
            <p>Choose your account type and enter your details.</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Account type</label>

              <div className="role-options">
                <label
                  className={`role-option ${
                    formData.role === "student" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === "student"}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Student</strong>
                    <small>
                      Build portfolios, resumes and check ATS scores.
                    </small>
                  </span>
                </label>

                <label
                  className={`role-option ${
                    formData.role === "recruiter" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={formData.role === "recruiter"}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Recruiter</strong>
                    <small>
                      Search, review and compare candidate profiles.
                    </small>
                  </span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Full name</label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>

            <div className="auth-form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone number</label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>

              <div className="password-field">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter password again"
                autoComplete="new-password"
              />
            </div>

            <button
              className="button button-primary auth-submit"
              type="submit"
              disabled={submitting}
            >
              <UserPlus size={18} />

              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Log in</Link>
          </p>

          <Link className="auth-home-link" to="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Signup;