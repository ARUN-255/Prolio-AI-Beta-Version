import { ExternalLink, Github, Linkedin, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getPublicPortfolio } from "../../Services/portfolioService";
import "../../Styles/portfolioPreview.css";

function PublicProfile() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const template = searchParams.get("template") || "classic";
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPublicPortfolio(slug);
        setPortfolio(data?.portfolio || null);
      } catch (err) {
        setError(err.response?.data?.message || "Portfolio not found.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (loading) return <div className="public-portfolio-status">Loading portfolio...</div>;
  if (error || !portfolio) return <div className="public-portfolio-status"><h1>Portfolio unavailable</h1><p>{error || "Portfolio not found."}</p></div>;

  const profile = portfolio.profile || {};
  const projects = portfolio.projects || [];
  const skills = portfolio.skills || [];
  const education = portfolio.education || [];
  const experiences = portfolio.experiences || [];
  const certificates = portfolio.certificates || [];

  return (
    <main className="public-portfolio-page">
      <article className={`portfolio-live-preview template-${template}`}>
        <header className="portfolio-live-hero">
          <div className="portfolio-live-avatar">{portfolio.user?.name?.charAt(0)?.toUpperCase() || "S"}</div>
          <div>
            <h1>{portfolio.user?.name || "Student"}</h1>
            {profile.headline && <h2>{profile.headline}</h2>}
            {profile.location && <p className="portfolio-live-location"><MapPin size={16} /> {profile.location}</p>}
            {profile.bio && <p className="portfolio-live-bio">{profile.bio}</p>}
            <div className="portfolio-live-links">
              {profile.website && <a href={profile.website} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Website</a>}
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>}
              {profile.github && <a href={profile.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>}
            </div>
          </div>
        </header>

        {skills.length > 0 && <section className="portfolio-live-section"><h2>Skills</h2><div className="portfolio-live-skills">{skills.map((skill) => <span key={`${skill.name}-${skill.category}`}>{skill.name}</span>)}</div></section>}

        {projects.length > 0 && <section className="portfolio-live-section"><h2>Projects</h2><div className="portfolio-live-grid">{projects.map((project) => <article className="portfolio-live-card" key={project.title}><h3>{project.title}</h3>{project.description && <p>{project.description}</p>}{Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && <small>{project.tech_stack.join(" · ")}</small>}{project.link && <a href={project.link} target="_blank" rel="noreferrer">View project <ExternalLink size={14} /></a>}</article>)}</div></section>}

        {education.length > 0 && <section className="portfolio-live-section"><h2>Education</h2><div className="portfolio-live-list">{education.map((item) => <article key={`${item.institution}-${item.degree}`}><h3>{item.degree}{item.field_of_study ? ` — ${item.field_of_study}` : ""}</h3><p>{item.institution}</p><small>{item.start_year || ""}{item.end_year ? ` – ${item.end_year}` : ""}{item.grade ? ` · ${item.grade}` : ""}</small>{item.description && <p>{item.description}</p>}</article>)}</div></section>}

        {experiences.length > 0 && <section className="portfolio-live-section"><h2>Experience</h2><div className="portfolio-live-list">{experiences.map((item) => <article key={`${item.company}-${item.role}`}><h3>{item.role}</h3><p>{item.company}</p>{item.description && <p>{item.description}</p>}</article>)}</div></section>}

        {certificates.length > 0 && <section className="portfolio-live-section"><h2>Certificates</h2><div className="portfolio-live-grid">{certificates.map((item) => <article className="portfolio-live-card" key={`${item.title}-${item.issuer}`}><h3>{item.title}</h3>{item.issuer && <p>{item.issuer}</p>}{item.date && <small>{String(item.date).slice(0, 10)}</small>}{item.file_url && <a href={item.file_url} target="_blank" rel="noreferrer">View credential <ExternalLink size={14} /></a>}</article>)}</div></section>}

        {portfolio.plan?.portfolio_watermark && (
          <footer className="portfolio-watermark">
            <span className="brand-mark" aria-hidden="true">P</span>
            <span>Portfolio powered by <strong>Prolio AI</strong></span>
          </footer>
        )}
      </article>
    </main>
  );
}

export default PublicProfile;
