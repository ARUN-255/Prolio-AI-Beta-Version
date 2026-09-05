import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Plus,
  Save,
  SkipForward,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExperience } from "../../Services/portfolioService";
import "../../Styles/portfolioModal.css";

const emptyExperience = {
  company: "",
  role: "",
  description: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  isPublic: true,
};

function AddExperience() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyExperience);
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
      ...(name === "isCurrent" && checked ? { endDate: "" } : {}),
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (!formData.company.trim() || !formData.role.trim()) {
      setError("Company and role are required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = await createExperience({
        company: formData.company.trim(),
        role: formData.role.trim(),
        description: formData.description.trim() || null,
        start_date: formData.startDate || null,
        end_date: formData.isCurrent ? null : formData.endDate || null,
        is_current: formData.isCurrent,
        is_public: formData.isPublic,
      });

      if (data?.success) setShowSuccessModal(true);
      else setError(data?.message || "Unable to save experience.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save experience.");
    } finally {
      setSaving(false);
    }
  };

  const addAnotherExperience = () => {
    setShowSuccessModal(false);
    setFormData(emptyExperience);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="portfolio-maker-page">
      <section className="portfolio-page-heading">
        <div>
          <p className="eyebrow">Portfolio details</p>
          <h1>Add experience</h1>
          <p>Add internships, jobs, freelance work or other relevant professional experience. If you do not have experience yet, you can skip this step.</p>
        </div>
      </section>

      {error && <div className="portfolio-message portfolio-message-error">{error}</div>}

      <form className="portfolio-profile-form" onSubmit={handleSubmit}>
        <section className="portfolio-form-card">
          <div className="portfolio-form-card-heading">
            <span className="portfolio-section-icon"><BriefcaseBusiness size={20} /></span>
            <div>
              <h2>Experience details</h2>
              <p>Company and role are required only if you choose to add experience.</p>
            </div>
          </div>

          <div className="portfolio-form-content">
            <div className="form-group">
              <label htmlFor="experience-company">Company</label>
              <input id="experience-company" name="company" type="text" value={formData.company} onChange={handleChange} placeholder="Example: OpenAI" maxLength={200} />
            </div>

            <div className="form-group">
              <label htmlFor="experience-role">Role</label>
              <input id="experience-role" name="role" type="text" value={formData.role} onChange={handleChange} placeholder="Example: Software Engineer Intern" maxLength={200} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experience-start-date">Start date</label>
                <input id="experience-start-date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="experience-end-date">End date</label>
                <input id="experience-end-date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} disabled={formData.isCurrent} />
              </div>
            </div>

            <label className="portfolio-visibility-option">
              <input name="isCurrent" type="checkbox" checked={formData.isCurrent} onChange={handleChange} />
              <span><strong>I currently work here</strong><small>End date will be left empty while this is enabled.</small></span>
            </label>

            <div className="form-group">
              <label htmlFor="experience-description">Description</label>
              <textarea id="experience-description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe your responsibilities, work and impact." rows={6} maxLength={1200} />
            </div>

            <label className="portfolio-visibility-option">
              <input name="isPublic" type="checkbox" checked={formData.isPublic} onChange={handleChange} />
              <span><strong>Show this experience publicly</strong><small>Public experience records can appear on your shared portfolio.</small></span>
            </label>
          </div>
        </section>

        <div className="portfolio-form-actions" style={{ gap: "10px", flexWrap: "wrap" }}>
          <button type="button" className="button button-ghost" onClick={() => navigate("/student/portfolio/education/add")}>
            <ArrowLeft size={17} /> Back
          </button>
          <button type="button" className="button button-secondary" onClick={() => navigate("/student/portfolio/certificate/add")}>
            <SkipForward size={17} /> Skip experience
          </button>
          <button type="submit" className="button button-primary" disabled={saving}>
            <Save size={18} /> {saving ? "Saving..." : "Save experience"}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="portfolio-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowSuccessModal(false);
        }}>
          <section className="portfolio-success-modal" role="dialog" aria-modal="true" aria-labelledby="experience-success-title">
            <button className="portfolio-modal-close" type="button" onClick={() => setShowSuccessModal(false)} aria-label="Close message"><X size={20} /></button>
            <span className="portfolio-success-icon"><CheckCircle2 size={30} /></span>
            <h2 id="experience-success-title">Experience saved successfully</h2>
            <p>Your experience has been added. You can add another one or continue to certificates.</p>
            <div className="portfolio-modal-actions portfolio-modal-actions-stacked-mobile">
              <button type="button" className="button button-ghost" onClick={() => setShowSuccessModal(false)}>Cancel</button>
              <button type="button" className="button button-secondary" onClick={addAnotherExperience}><Plus size={17} /> Add another experience</button>
              <button type="button" className="button button-primary" onClick={() => navigate("/student/portfolio/certificate/add")}>Continue to certificates <ArrowRight size={17} /></button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AddExperience;
