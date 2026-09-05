import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Plus,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEducation } from "../../Services/portfolioService";
import "../../Styles/portfolioModal.css";

const currentYear = new Date().getFullYear();

const emptyEducation = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startYear: "",
  endYear: "",
  grade: "",
  description: "",
  isPublic: true,
};

function AddEducation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyEducation);
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

    if (!formData.institution.trim() || !formData.degree.trim()) {
      setError("Institution and degree are required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const startYear = formData.startYear ? Number(formData.startYear) : null;
    const endYear = formData.endYear ? Number(formData.endYear) : null;

    if (startYear && (startYear < 1950 || startYear > currentYear + 10)) {
      setError("Please enter a valid start year.");
      return;
    }

    if (endYear && (endYear < 1950 || endYear > currentYear + 15)) {
      setError("Please enter a valid end year.");
      return;
    }

    if (startYear && endYear && endYear < startYear) {
      setError("End year cannot be earlier than start year.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = await createEducation({
        institution: formData.institution.trim(),
        degree: formData.degree.trim(),
        field_of_study: formData.fieldOfStudy.trim() || null,
        start_year: startYear,
        end_year: endYear,
        grade: formData.grade.trim() || null,
        description: formData.description.trim() || null,
        is_public: formData.isPublic,
      });

      if (data?.success) setShowSuccessModal(true);
      else setError(data?.message || "Unable to save education.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save education.");
    } finally {
      setSaving(false);
    }
  };

  const addAnotherEducation = () => {
    setShowSuccessModal(false);
    setFormData(emptyEducation);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="portfolio-maker-page">
      <section className="portfolio-page-heading">
        <div>
          <p className="eyebrow">Portfolio details</p>
          <h1>Add education</h1>
          <p>Add your college, degree and academic details.</p>
        </div>
      </section>

      {error && <div className="portfolio-message portfolio-message-error">{error}</div>}

      <form className="portfolio-profile-form" onSubmit={handleSubmit}>
        <section className="portfolio-form-card">
          <div className="portfolio-form-card-heading">
            <span className="portfolio-section-icon"><GraduationCap size={20} /></span>
            <div>
              <h2>Education details</h2>
              <p>Institution and degree are required. Other fields are optional.</p>
            </div>
          </div>

          <div className="portfolio-form-content">
            <div className="form-group">
              <label htmlFor="education-institution">Institution</label>
              <input id="education-institution" name="institution" type="text" value={formData.institution} onChange={handleChange} placeholder="Example: GRT Institute of Engineering and Technology" maxLength={200} required />
            </div>

            <div className="form-group">
              <label htmlFor="education-degree">Degree</label>
              <input id="education-degree" name="degree" type="text" value={formData.degree} onChange={handleChange} placeholder="Example: B.Tech Information Technology" maxLength={200} required />
            </div>

            <div className="form-group">
              <label htmlFor="education-field">Field of study</label>
              <input id="education-field" name="fieldOfStudy" type="text" value={formData.fieldOfStudy} onChange={handleChange} placeholder="Example: Information Technology" maxLength={200} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="education-start-year">Start year</label>
                <input id="education-start-year" name="startYear" type="number" value={formData.startYear} onChange={handleChange} placeholder="2024" min="1950" max={currentYear + 10} />
              </div>
              <div className="form-group">
                <label htmlFor="education-end-year">End year</label>
                <input id="education-end-year" name="endYear" type="number" value={formData.endYear} onChange={handleChange} placeholder="2028" min="1950" max={currentYear + 15} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="education-grade">Grade / CGPA</label>
              <input id="education-grade" name="grade" type="text" value={formData.grade} onChange={handleChange} placeholder="Example: 8.2 CGPA" maxLength={100} />
            </div>

            <div className="form-group">
              <label htmlFor="education-description">Description</label>
              <textarea id="education-description" name="description" value={formData.description} onChange={handleChange} placeholder="Add relevant academic activities or achievements." rows={5} maxLength={1000} />
            </div>

            <label className="portfolio-visibility-option">
              <input name="isPublic" type="checkbox" checked={formData.isPublic} onChange={handleChange} />
              <span><strong>Show this education publicly</strong><small>Public education records can appear on your shared portfolio.</small></span>
            </label>
          </div>
        </section>

        <div className="portfolio-form-actions" style={{ gap: "10px" }}>
          <button type="button" className="button button-ghost" onClick={() => navigate("/student/portfolio/skill/add")}>
            <ArrowLeft size={17} /> Back
          </button>
          <button type="submit" className="button button-primary" disabled={saving}>
            <Save size={18} /> {saving ? "Saving..." : "Save education"}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="portfolio-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowSuccessModal(false);
        }}>
          <section className="portfolio-success-modal" role="dialog" aria-modal="true" aria-labelledby="education-success-title">
            <button className="portfolio-modal-close" type="button" onClick={() => setShowSuccessModal(false)} aria-label="Close message"><X size={20} /></button>
            <span className="portfolio-success-icon"><CheckCircle2 size={30} /></span>
            <h2 id="education-success-title">Education saved successfully</h2>
            <p>Your education has been added. You can add another record or continue to your experience.</p>
            <div className="portfolio-modal-actions portfolio-modal-actions-stacked-mobile">
              <button type="button" className="button button-ghost" onClick={() => setShowSuccessModal(false)}>Cancel</button>
              <button type="button" className="button button-secondary" onClick={addAnotherEducation}><Plus size={17} /> Add another education</button>
              <button type="button" className="button button-primary" onClick={() => navigate("/student/portfolio/experience/add")}>Continue to experience <ArrowRight size={17} /></button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AddEducation;
