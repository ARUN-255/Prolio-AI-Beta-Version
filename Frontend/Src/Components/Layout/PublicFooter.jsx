import { Link } from "react-router-dom";

function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-about">
          <Link className="brand footer-brand" to="/" aria-label="Prolio AI home">
            <span className="brand-mark" aria-hidden="true">
              P
            </span>

            <span>
              Prolio <strong>AI</strong>
            </span>
          </Link>

          <p>
            A simple platform for students to build portfolios, create resumes
            and check their career profile.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h3>Platform</h3>
            <Link to="/features">Features</Link>
            <Link to="/students">For Students</Link>
            <Link to="/recruiters">For Recruiters</Link>
            <Link to="/pricing">Pricing</Link>
          </div>

          <div className="footer-column">
            <h3>Account</h3>
            <Link to="/login">Log in</Link>
            <Link to="/register">Create account</Link>
          </div>

          <div className="footer-column">
            <h3>Legal</h3>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/refund">Refund Policy</Link>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 Prolio AI. All rights reserved.</p>

        <p className="footer-note">
          Built to make career tools easier to use.
        </p>
      </div>
    </footer>
  );
}

export default PublicFooter;