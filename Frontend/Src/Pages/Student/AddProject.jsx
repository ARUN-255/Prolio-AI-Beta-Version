import { ArrowLeft, FolderPlus, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../../Services/portfolioService";

const emptyProject = {
  title: "",
  description: "",
  techStack: "",
  link: "",
  isPublic: true,
};

function AddProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyProject);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Project title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createProject({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        tech_stack: formData.techStack
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        link: formData.link.trim() || null,
        is_public: formData.isPublic,
      });

      navigate("/student/portfolio", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portfolio-maker-page">
      <section className="portfolio-page-heading">
        <div>
          <p className="eyebrow">Portfolio details</p>
          <h1>Add a project</h1>
          <p>Add one of your strongest projects first. You can add more portfolio sections after this.</p>
        </div>
      </section>

      {error && <div className="portfolio-message portfolio-message-error">{error}</div>}

      <form className="portfolio-profile-form" onSubmit={handleSubmit}>
        <section className="portfolio-form-card">
          <div className="portfolio-form-card-heading">
            <span className="portfolio-section-icon"><FolderPlus size={20} /></span>
            <div>
              <h2>Project details</h2>
              <p>Use a clear title and describe what you built and which technologies you used.</p>
            </div>
          </div>

          <div className="portfolio-form-content">
            <div className="form-group">
              <label htmlFor="project-title">Project title</label>
              <input id="project-title" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Example: Prolio AI" maxLength={160} required />
            </div>

            <div className="form-group">
              <label htmlFor="project-description">Description</label>
              <textarea id="project-description" name="description" value={formData.description} onChange={handleChange} placeholder="Explain what the project does and what you worked on." rows={6} maxLength={1200} />
            </div>

            <div className="form-group">
              <label htmlFor="project-tech-stack">Tech stack</label>
              <input id="project-tech-stack" name="techStack" type="text" value={formData.techStack} onChange={handleChange} placeholder="React, Node.js, Express, PostgreSQL" />
              <small>Separate technologies with commas.</small>
            </div>

            <div className="form-group">
              <label htmlFor="project-link">Project or GitHub link</label>
              <input id="project-link" name="link" type="url" value={formData.link} onChange={handleChange} placeholder="https://github.com/username/project" />
            </div>

            <label className="portfolio-visibility-option">
              <input name="isPublic" type="checkbox" checked={formData.isPublic} onChange={handleChange} />
              <span>
                <strong>Show this project publicly</strong>
                <small>Public projects can appear on your shared portfolio.</small>
              </span>
            </label>
          </div>
        </section>

        <div className="portfolio-form-actions" style={{ gap: "10px" }}>
          <button type="button" className="button button-ghost" onClick={() => navigate("/student/portfolio")}>
            <ArrowLeft size={17} /> Back
          </button>
          <button type="submit" className="button button-primary" disabled={saving}>
            <Save size={18} /> {saving ? "Saving..." : "Save project"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProject;
