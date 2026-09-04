import { Link } from "react-router-dom";

function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" to="/" aria-label="Prolio AI home">
            <span className="brand-mark" aria-hidden="true">P</span>
            <span>Prolio <strong>AI</strong></span>
          </Link>
          <p className="footer-copy">
            A simple workspace for portfolios, resumes, ATS checks and recruiter tools.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h3>Platform</h3>
            <Link to="/features">Features</Link>
            <Link to="/students">For Students</Link>
            <Link to="/recruiters">For Recruiters</Link>
            <Link to="/pricing">Pricing</Link>
          </div>

          <div>
            <h3>Account</h3>
            <Link to="/login">Log in</Link>
            <Link to="/register">Create account</Link>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 Prolio AI. All rights reserved.</p>
        <div>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/refund">Refund policy</Link>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
