import {
  ArrowRight,
  BriefcaseBusiness,
  FileCheck2,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";

import PublicHeader from "../../Components/Layout/PublicHeader";
import PublicFooter from "../../Components/Layout/PublicFooter";

const features = [
  {
    icon: UserRound,
    title: "Portfolio Builder",
    description:
      "Create a professional portfolio using your education, skills, projects and experience.",
  },
  {
    icon: FileCheck2,
    title: "Resume & ATS",
    description:
      "Build resumes and check how well they match the job you are applying for.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Recruiter Tools",
    description:
      "Recruiters can search candidates, compare resumes and understand candidate profiles.",
  },
];

function HomePage() {
  return (
    <div className="public-page">
      {/* Header */}
      <PublicHeader />

      {/* Main page content */}
      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Career tools in one place</p>

              <h1>Build your professional profile with Prolio AI.</h1>

              <p className="hero-description">
                Create your portfolio, build resumes, check ATS compatibility
                and use simple career tools from one platform.
              </p>

              <div className="hero-actions">
                <Link
                  className="button button-primary button-large"
                  to="/register"
                >
                  Get Started
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>

                <Link
                  className="button button-secondary button-large"
                  to="/features"
                >
                  View Features
                </Link>
              </div>
            </div>

            <div className="hero-panel">
              <h2>What can you do?</h2>

              <div className="home-tool-list">
                <div>
                  <strong>Create Portfolio</strong>
                  <span>Show your skills and projects.</span>
                </div>

                <div>
                  <strong>Build Resume</strong>
                  <span>Create and export your resume.</span>
                </div>

                <div>
                  <strong>Check ATS</strong>
                  <span>Compare your resume with a job.</span>
                </div>

                <div>
                  <strong>Use AI Profile</strong>
                  <span>Answer questions using your profile.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="feature-section"
          aria-labelledby="feature-heading"
        >
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Main Features</p>

              <h2 id="feature-heading">
                Tools for students and recruiters
              </h2>

              <p>
                Prolio keeps the important career tools simple and easy to
                access.
              </p>
            </div>

            <div className="feature-grid">
              {features.map(
                ({ icon: Icon, title, description }) => (
                  <article className="feature-card" key={title}>
                    <span className="feature-icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>

                    <h3>{title}</h3>

                    <p>{description}</p>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        <section className="home-cta-section">
          <div className="container home-cta">
            <div>
              <h2>Ready to create your profile?</h2>

              <p>
                Create an account and start building your professional
                profile.
              </p>
            </div>

            <Link className="button button-primary" to="/register">
              Create Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}

export default HomePage;