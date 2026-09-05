import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Github,
  Linkedin,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCompletePortfolio,
  updatePortfolioSlug,
} from "../../Services/portfolioService";
import "../../Styles/portfolioPreview.css";

function PortfolioPreview() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState("");
  const [savingSlug, setSavingSlug] = useState(false);
  const [slugMessage, setSlugMessage] = useState("");
  const template = localStorage.getItem("prolio_portfolio_template") || "classic";

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        const data = await getCompletePortfolio();
        const loaded = data?.portfolio || null;
        setPortfolio(loaded);
        setSlug(loaded?.user?.public_slug || "");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your portfolio preview.");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const shareUrl = useMemo(() => {
    if (!portfolio?.user?.public_slug) return "";
    return `${window.location.origin}/p/${portfolio.user.public_slug}?template=${template}`;
  }, [portfolio, template]);

  const copyShareLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const saveCustomSlug = async () => {
    if (!slug.trim() || savingSlug) return;

    try {
      setSavingSlug(true);
      setSlugMessage("");
      const data = await updatePortfolioSlug(slug);
      const newSlug = data?.public_slug;

      if (newSlug) {
        setSlug(newSlug);
        setPortfolio((current) => ({
          ...current,
          user: { ...current.user, public_slug: newSlug },
        }));
        setSlugMessage("Custom portfolio link saved.");
      }
    } catch (err) {
      setSlugMessage(err.response?.data?.message || "Unable to update portfolio link.");
    } finally {
      setSavingSlug(false);
    }
  };

  if (loading) return <div className="portfolio-preview-status">Loading portfolio preview...</div>;

  if (error || !portfolio) {
    return (
      <div className="portfolio-preview-status">
        <h2>Portfolio preview unavailable</h2>
        <p>{error || "Your portfolio could not be loaded."}</p>
        <button className="button button-primary" type="button" onClick={() => navigate("/student/portfolio")}>Back to portfolio</button>
      </div>
    );
  }

  const profile = portfolio.profile || {};
  const projects = (portfolio.projects || []).filter((item) => item.is_public !== false);
  const skills = (portfolio.skills || []).filter((item) => item.is_public !== false);
  const education = (portfolio.education || []).filter((item) => item.is_public !== false);
  const experiences = (portfolio.experiences || []).filter((item) => item.is_public !== false);
  const certificates = (portfolio.certificates || []).filter((item) => item.is_public !== false);
  const plan = portfolio.plan || {};

  return (
    <div className="portfolio-preview-page">
      <div className="portfolio-preview-toolbar">
        <button type="button" className="button button-ghost" onClick={() => navigate("/student/portfolio/templates")}>
          <ArrowLeft size={17} /> Change template
        </button>
        <span>Previewing: <strong>{template.charAt(0).toUpperCase() + template.slice(1)}</strong></span>
      </div>

      <section className="portfolio-share-panel">
        <div>
          <p className="eyebrow">Share portfolio</p>
          <h2>Your public portfolio link</h2>
          <p>Anyone with this link can view the public sections of your portfolio.</p>
        </div>
        <div className="portfolio-share-row">
          <input value={shareUrl} readOnly aria-label="Public portfolio link" />
          <button type="button" className="button button-primary" onClick={copyShareLink} disabled={!shareUrl}>
            {copied ? <Check size={17} /> : <Copy size={17} />}
            {copied ? "Copied" : "Copy link"}
          </button>
          {shareUrl && (
            <a className="button button-ghost" href={shareUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={17} /> Open
            </a>
          )}
        </div>

        {plan.custom_link ? (
          <div className="portfolio-custom-link-box">
            <div>
              <strong>Custom portfolio link</strong>
              <small>Your plan allows you to choose the link name.</small>
            </div>
            <div className="portfolio-custom-link-controls">
              <span>/p/</span>
              <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="your-name" />
              <button type="button" className="button button-secondary" onClick={saveCustomSlug} disabled={savingSlug}>
                {savingSlug ? "Saving..." : "Save link"}
              </button>
            </div>
            {slugMessage && <p className="portfolio-link-message">{slugMessage}</p>}
          </div>
        ) : (
          <div className="portfolio-free-link-note">
            <strong>Free plan link</strong>
            <span>Upgrade to Student Pro to customize your portfolio link and remove Prolio AI branding.</span>
          </div>
        )}
      </section>

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

        {skills.length > 0 && <section className="portfolio-live-section"><h2>Skills</h2><div className="portfolio-live-skills">{skills.map((skill) => <span key={skill.id || `${skill.name}-${skill.category}`}>{skill.name}</span>)}</div></section>}

        {projects.length > 0 && <section className="portfolio-live-section"><h2>Projects</h2><div className="portfolio-live-grid">{projects.map((project) => <article className="portfolio-live-card" key={project.id || project.title}><h3>{project.title}</h3>{project.description && <p>{project.description}</p>}{Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && <small>{project.tech_stack.join(" · ")}</small>}{project.link && <a href={project.link} target="_blank" rel="noreferrer">View project <ExternalLink size={14} /></a>}</article>)}</div></section>}

        {education.length > 0 && <section className="portfolio-live-section"><h2>Education</h2><div className="portfolio-live-list">{education.map((item) => <article key={item.id || `${item.institution}-${item.degree}`}><h3>{item.degree}{item.field_of_study ? ` — ${item.field_of_study}` : ""}</h3><p>{item.institution}</p><small>{item.start_year || ""}{item.end_year ? ` – ${item.end_year}` : ""}{item.grade ? ` · ${item.grade}` : ""}</small>{item.description && <p>{item.description}</p>}</article>)}</div></section>}

        {experiences.length > 0 && <section className="portfolio-live-section"><h2>Experience</h2><div className="portfolio-live-list">{experiences.map((item) => <article key={item.id || `${item.company}-${item.role}`}><h3>{item.role}</h3><p>{item.company}</p>{item.description && <p>{item.description}</p>}</article>)}</div></section>}

        {certificates.length > 0 && <section className="portfolio-live-section"><h2>Certificates</h2><div className="portfolio-live-grid">{certificates.map((item) => <article className="portfolio-live-card" key={item.id || `${item.title}-${item.issuer}`}><h3>{item.title}</h3>{item.issuer && <p>{item.issuer}</p>}{item.date && <small>{String(item.date).slice(0, 10)}</small>}{item.file_url && <a href={item.file_url} target="_blank" rel="noreferrer">View credential <ExternalLink size={14} /></a>}</article>)}</div></section>}

        {plan.portfolio_watermark && (
          <footer className="portfolio-watermark">
            <span className="brand-mark" aria-hidden="true">P</span>
            <span>Portfolio powered by <strong>Prolio AI</strong></span>
          </footer>
        )}
      </article>
    </div>
  );
}

export default PortfolioPreview;
