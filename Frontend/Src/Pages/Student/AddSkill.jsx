import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plus,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSkill } from "../../Services/portfolioService";
import "../../Styles/portfolioModal.css";

const emptySkill = {
  name: "",
  category: "",
  proficiency: "Intermediate",
  isPublic: true,
};

function AddSkill() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptySkill);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!showSuccessModal) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setShowSuccessModal(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showSuccessModal]);

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

    if (saving) return;

    if (!formData.name.trim()) {
      setError("Skill name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createSkill({
        name: formData.name.trim(),
        category: formData.category.trim() || null,
        proficiency: formData.proficiency || null,
        is_public: formData.isPublic,
      });

      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save skill.");
    } finally {
      setSaving(false);
    }
  };

  const addAnotherSkill = () => {
    setShowSuccessModal(false);
    setFormData(emptySkill);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="portfolio-maker-page">
      <section className="portfolio-page-heading">
        <div>
          <p className="eyebrow">Portfolio details</p>
          <h1>Add a skill</h1>
          <p>Add the technical or professional skills you want recruiters to notice.</p>
        </div>
      </section>

      {error && <div className="portfolio-message portfolio-message-error">{error}</div>}

      <form className="portfolio-profile-form" onSubmit={handleSubmit}>
        <section className="portfolio-form-card">
          <div className="portfolio-form-card-heading">
            <span className="portfolio-section-icon"><Sparkles size={20} /></span>
            <div>
              <h2>Skill details</h2>
              <p>Keep the name specific and choose the closest proficiency level.</p>
            </div>
          </div>

          <div className="portfolio-form-content">
            <div className="form-group">
              <label htmlFor="skill-name">Skill name</label>
              <input
                id="skill-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: React"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="skill-category">Category</label>
              <input
                id="skill-category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="Example: Frontend Development"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="skill-proficiency">Proficiency</label>
              <select
                id="skill-proficiency"
                name="proficiency"
                value={formData.proficiency}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <label className="portfolio-visibility-option">
              <input
                name="isPublic"
                type="checkbox"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <span>
                <strong>Show this skill publicly</strong>
                <small>Public skills can appear on your shared portfolio.</small>
              </span>
            </label>
          </div>
        </section>

        <div className="portfolio-form-actions" style={{ gap: "10px" }}>
          <button type="button" className="button button-ghost" onClick={() => navigate("/student/portfolio/project/add")}>
            <ArrowLeft size={17} /> Back
          </button>
          <button type="submit" className="button button-primary" disabled={saving}>
            <Save size={18} /> {saving ? "Saving..." : "Save skill"}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div
          className="portfolio-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowSuccessModal(false);
          }}
        >
          <section className="portfolio-success-modal" role="dialog" aria-modal="true" aria-labelledby="skill-success-title">
            <button className="portfolio-modal-close" type="button" onClick={() => setShowSuccessModal(false)} aria-label="Close message">
              <X size={20} />
            </button>
            <span className="portfolio-success-icon"><CheckCircle2 size={30} /></span>
            <h2 id="skill-success-title">Skill saved successfully</h2>
            <p>Your skill has been added. You can add another skill or continue to your education details.</p>
            <div className="portfolio-modal-actions portfolio-modal-actions-stacked-mobile">
              <button type="button" className="button button-ghost" onClick={() => setShowSuccessModal(false)}>Cancel</button>
              <button type="button" className="button button-secondary" onClick={addAnotherSkill}>
                <Plus size={17} /> Add another skill
              </button>
              <button type="button" className="button button-primary" onClick={() => navigate("/student/portfolio/education/add")}>
                Continue to education <ArrowRight size={17} />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AddSkill;
