import { ArrowRight, BriefcaseBusiness, FileCheck2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import PublicHeader from "../../Components/Layout/PublicHeader";
import PublicFooter from "../../Components/Layout/PublicFooter";

const features = [
  {
    icon: UserRound,
    title: "Portfolio Builder",
    copy: "Keep your education, skills, projects and experience in one profile.",
  },
  {
    icon: FileCheck2,
    title: "Resume and ATS",
    copy: "Create resumes and check how closely they match a job description.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Recruiter Tools",
    copy: "Search, compare and review candidate profiles from one workspace.",
  },
];

function HomePage() {
  return (
    <div className="public-page">
      <PublicHeader />

      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Career tools in one place</p>
              <h1>Build your profile and present your skills better.</h1>
              <p className="hero-description">
                Prolio AI helps students create portfolios and resumes, check ATS scores,
                and gives recruiters simple tools to review candidates.
              </p>

              <div className="hero-actions">
                <Link className="button button-primary button-large" to="/register">
                  Get started <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="button button-secondary button-large" to="/features">
                  View features
                </Link>
              </div>
            </div>

            <div className="hero-panel" aria-label="Prolio workspace preview">
              <h2>What you can do</h2>
              <div className="simple-preview-list">
                <div>
                  <strong>Create a portfolio</strong>
                  <span>Share your profile, projects and skills.</span>
                </div>
                <div>
                  <strong>Build a resume</strong>
                  <span>Create and export resumes from your data.</span>
                </div>
                <div>
                  <strong>Check ATS score</strong>
                  <span>Compare your resume with a job role.</span>
                </div>
                <div>
                  <strong>Use recruiter tools</strong>
                  <span>Search and compare candidate profiles.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-section" aria-labelledby="feature-title">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Main features</p>
              <h2 id="feature-title">Simple tools for students and recruiters.</h2>
              <p>
                The platform keeps the important actions clear and easy to understand without too many menus or animations.
              </p>
            </div>

            <div className="feature-grid feature-grid-three">
              {features.map(({ icon: Icon, title, copy }) => (
                <article className="feature-card" key={title}>
                  <span className="feature-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-cta">
          <div className="container home-cta-inner">
            <div>
              <h2>Start building your professional profile.</h2>
              <p>Create an account and keep your career information in one place.</p>
            </div>
            <Link className="button button-primary button-large" to="/register">
              Create account
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default HomePage;
