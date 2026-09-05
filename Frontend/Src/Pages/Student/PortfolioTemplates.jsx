import {
  Check,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const templates = [
  {
    id: "classic",
    name: "Classic",
    description: "A simple professional layout with clear sections and minimal styling.",
    previewClass: "portfolio-template-preview-classic",
  },
  {
    id: "modern",
    name: "Modern",
    description: "A clean card-based layout with stronger visual separation between sections.",
    previewClass: "portfolio-template-preview-modern",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "A lightweight layout that keeps attention on your profile, projects and skills.",
    previewClass: "portfolio-template-preview-minimal",
  },
];

function PortfolioTemplates() {
  const navigate = useNavigate();
  const storedTemplate = localStorage.getItem("prolio_portfolio_template") || "classic";
  const [selectedTemplate, setSelectedTemplate] = useState(storedTemplate);

  const handleContinue = () => {
    localStorage.setItem("prolio_portfolio_template", selectedTemplate);
    navigate("/student/portfolio");
  };

  return (
    <div className="portfolio-maker-page">
      <section className="portfolio-page-heading">
        <div>
          <p className="eyebrow">Portfolio template</p>
          <h1>Choose how your portfolio should look</h1>
          <p>
            Select a template for your public portfolio. You can change this later without losing your profile information.
          </p>
        </div>
      </section>

      <section className="portfolio-template-grid" aria-label="Portfolio templates">
        {templates.map((template) => {
          const selected = selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              type="button"
              className={`portfolio-template-card ${selected ? "is-selected" : ""}`}
              onClick={() => setSelectedTemplate(template.id)}
              aria-pressed={selected}
            >
              <div className={`portfolio-template-preview ${template.previewClass}`}>
                <div className="portfolio-template-preview-bar" />
                <div className="portfolio-template-preview-title" />
                <div className="portfolio-template-preview-line" />
                <div className="portfolio-template-preview-line short" />
                <div className="portfolio-template-preview-blocks">
                  <span />
                  <span />
                </div>
              </div>

              <div className="portfolio-template-card-content">
                <div className="portfolio-template-card-heading">
                  <span className="portfolio-section-icon">
                    <LayoutTemplate size={19} />
                  </span>
                  <div>
                    <h2>{template.name}</h2>
                    <p>{template.description}</p>
                  </div>
                </div>

                <span className={`portfolio-template-select-indicator ${selected ? "is-selected" : ""}`}>
                  {selected ? <><Check size={16} /> Selected</> : "Select template"}
                </span>
              </div>
            </button>
          );
        })}
      </section>

      <section className="portfolio-template-note">
        <Sparkles size={18} />
        <p>The free student plan includes these three portfolio templates.</p>
      </section>

      <div className="portfolio-form-actions">
        <button type="button" className="button button-primary" onClick={handleContinue}>
          Continue with {templates.find((template) => template.id === selectedTemplate)?.name || "template"}
        </button>
      </div>
    </div>
  );
}

export default PortfolioTemplates;
