import {
  ArrowRight,
  Bot,
  FileCheck2,
  FileText,
  FolderKanban,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../../Context/AuthContext";

const quickActions = [
  {
    title: "Edit Portfolio",
    description:
      "Update your profile, education, skills, projects and experience.",
    to: "/student/portfolio",
    icon: UserRound,
  },
  {
    title: "Build Resume",
    description:
      "Create and manage resumes using your professional information.",
    to: "/student/resumes",
    icon: FileText,
  },
  {
    title: "Check ATS",
    description:
      "Compare your resume with a job description and view the match.",
    to: "/student/ats",
    icon: FileCheck2,
  },
];

function Dashboard() {
  const { user } = useAuth();

  const firstName =
    user?.name?.trim()?.split(" ")[0] || "Student";

  return (
    <div className="student-dashboard-page">
      <section className="dashboard-page-heading">
        <div>
          <p className="eyebrow">Dashboard</p>

          <h1>Welcome, {firstName}</h1>

          <p>
            Manage your portfolio, resumes and career tools from
            one place.
          </p>
        </div>
      </section>

      <section
        className="student-dashboard-section"
        aria-labelledby="quick-actions-heading"
      >
        <div className="dashboard-section-heading">
          <div>
            <h2 id="quick-actions-heading">Quick actions</h2>

            <p>
              Continue working on the main parts of your profile.
            </p>
          </div>
        </div>

        <div className="student-quick-grid">
          {quickActions.map(
            ({ title, description, to, icon: Icon }) => (
              <Link
                key={title}
                className="student-quick-card"
                to={to}
              >
                <span className="student-quick-icon">
                  <Icon size={21} />
                </span>

                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>

                <ArrowRight
                  className="student-quick-arrow"
                  size={18}
                />
              </Link>
            )
          )}
        </div>
      </section>

      <section className="student-dashboard-grid">
        <article className="student-dashboard-card">
          <div className="student-dashboard-card-heading">
            <span className="student-dashboard-card-icon">
              <FolderKanban size={20} />
            </span>

            <div>
              <h2>Portfolio</h2>
              <p>Your public professional profile.</p>
            </div>
          </div>

          <div className="student-dashboard-card-body">
            <p>
              Add your projects, skills, education and experience
              before sharing your portfolio.
            </p>

            <Link
              className="dashboard-text-link"
              to="/student/portfolio"
            >
              Manage portfolio
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>

        <article className="student-dashboard-card">
          <div className="student-dashboard-card-heading">
            <span className="student-dashboard-card-icon">
              <FileText size={20} />
            </span>

            <div>
              <h2>Resumes</h2>
              <p>Create resumes for different applications.</p>
            </div>
          </div>

          <div className="student-dashboard-card-body">
            <p>
              Build structured resumes and export them when you are
              ready to apply.
            </p>

            <Link
              className="dashboard-text-link"
              to="/student/resumes"
            >
              Open resumes
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>

        <article className="student-dashboard-card">
          <div className="student-dashboard-card-heading">
            <span className="student-dashboard-card-icon">
              <Bot size={20} />
            </span>

            <div>
              <h2>AI profile</h2>
              <p>Your portfolio-powered chatbot.</p>
            </div>
          </div>

          <div className="student-dashboard-card-body">
            <p>
              Once your portfolio is complete, your public chatbot
              can answer questions using your profile information.
            </p>
          </div>
        </article>

        <article className="student-dashboard-card">
          <div className="student-dashboard-card-heading">
            <span className="student-dashboard-card-icon">
              <FileCheck2 size={20} />
            </span>

            <div>
              <h2>ATS checker</h2>
              <p>Review resume and job compatibility.</p>
            </div>
          </div>

          <div className="student-dashboard-card-body">
            <p>
              Use your saved resume with a job description to check
              your ATS match.
            </p>

            <Link
              className="dashboard-text-link"
              to="/student/ats"
            >
              Check resume
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;