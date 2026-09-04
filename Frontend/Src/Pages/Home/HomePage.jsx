import { ArrowRight, BriefcaseBusiness, FileCheck2, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import PublicHeader from "../../Components/Layout/PublicHeader";

const features = [
  {
    icon: UserRound,
    title: "Build your portfolio",
    copy: "Turn your education, skills, projects and experience into a clear professional profile.",
  },
  {
    icon: FileCheck2,
    title: "Create stronger resumes",
    copy: "Build structured resumes and check how well they match the roles you are targeting.",
  },
  {
    icon: Sparkles,
    title: "Use AI with context",
    copy: "Let your public profile answer relevant questions about your work without hiding the facts.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Evaluate candidates",
    copy: "Give recruiters focused tools to search, compare and understand opted-in candidate profiles.",
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
              <p className="eyebrow">One professional workspace</p>
              <h1>Build your profile. Prove your skills. Move forward.</h1>
              <p className="hero-description">
                Prolio AI brings portfolios, resumes, ATS insights and career tools into one clear workspace for students and recruiters.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary button-large" to="/register">
                  Start building <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="button button-secondary button-large" to="/features">Explore features</Link>
              </div>
              <p className="hero-note">Simple to understand. Fast to use. Built around your work.</p>
            </div>

            <div className="hero-panel" aria-label="Prolio workspace preview">
              <div className="preview-topbar">
                <span className="preview-label">Your workspace</span>
                <span className="status-pill"><span /> Profile active</span>
              </div>
              <div className="preview-profile">
                <div className="preview-avatar" aria-hidden="true">AR</div>
                <div>
                  <strong>Your professional profile</strong>
                  <p>Projects, skills and experience in one place.</p>
                </div>
              </div>
              <div className="preview-progress">
                <div className="progress-heading"><span>Profile strength</span><strong>80%</strong></div>
                <div className="progress-track"><span /></div>
              </div>
              <div className="preview-cards">
                <div><strong>Portfolio</strong><span>Ready to share</span></div>
                <div><strong>Resume</strong><span>Build &amp; export</span></div>
                <div><strong>ATS</strong><span>Check your match</span></div>
                <div><strong>AI profile</strong><span>Answer with context</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-section" aria-labelledby="feature-title">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Designed for clarity</p>
              <h2 id="feature-title">Everything important stays easy to find.</h2>
              <p>No crowded menus, hidden actions or unnecessary animation. Each tool has a clear purpose.</p>
            </div>
            <div className="feature-grid">
              {features.map(({ icon: Icon, title, copy }) => (
                <article className="feature-card" key={title}>
                  <span className="feature-icon"><Icon size={22} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
