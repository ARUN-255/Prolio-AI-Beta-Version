import {
  ArrowLeft,
  CheckCircle2,
  FileBadge2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCertificate } from "../../Services/portfolioService";
import "../../Styles/portfolioModal.css";

const emptyCertificate = {
  title: "",
  issuer: "",
  date: "",
  fileUrl: "",
  isPublic: true,
};

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function AddCertificate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyCertificate);
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

    if (!formData.title.trim()) {
      setError("Certificate title is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = await createCertificate({
        title: formData.title.trim(),
        issuer: formData.issuer.trim() || null,
        date: formData.date || null,
        file_url: normalizeUrl(formData.fileUrl),
        is_public: formData.isPublic,
      });

      if (data?.success) {
        setShowSuccessModal(true);
      } else {
        setError(data?.message || "Unable to save certificate.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save certificate.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const addAnotherCertificate = () => {
    setShowSuccessModal(false);
    setFormData(emptyCertificate);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="portfolio-maker-page">
      <section className="portfolio-page-heading">
        <div>
          <p className="eyebrow">Portfolio details</p>
          <h1>Add a certificate</h1>
          <p>Add certifications, course completions or other credentials you want recruiters to see.</p>
        </div>
      </section>

      {error && <div className="portfolio-message portfolio-message-error">{error}</div>}

      <form className="portfolio-profile-form" onSubmit={handleSubmit}>
        <section className="portfolio-form-card">
          <div className="portfolio-form-card-heading">
            <span className="portfolio-section-icon"><FileBadge2 size={20} /></span>
            <div>
              <h2>Certificate details</h2>
              <p>Certificate title is required. Issuer, date and credential link are optional.</p>
            </div>
          </div>

          <div className="portfolio-form-content">
            <div className="form-group">
              <label htmlFor="certificate-title">Certificate title</label>
              <input id="certificate-title" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Example: AWS Cloud Practitioner" maxLength={200} required />
            </div>

            <div className="form-group">
              <label htmlFor="certificate-issuer">Issuer</label>
              <input id="certificate-issuer" name="issuer" type="text" value={formData.issuer} onChange={handleChange} placeholder="Example: Amazon Web Services" maxLength={200} />
            </div>

            <div className="form-group">
              <label htmlFor="certificate-date">Date</label>
              <input id="certificate-date" name="date" type="date" value={formData.date} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="certificate-file-url">Credential or certificate link</label>
              <input id="certificate-file-url" name="fileUrl" type="text" value={formData.fileUrl} onChange={handleChange} placeholder="credly.com/badges/... or https://..." />
            </div>

            <label className="portfolio-visibility-option">
              <input name="isPublic" type="checkbox" checked={formData.isPublic} onChange={handleChange} />
              <span>
                <strong>Show this certificate publicly</strong>
                <small>Public certificates can appear on your shared portfolio.</small>
              </span>
            </label>
          </div>
        </section>

        <div className="portfolio-form-actions" style={{ gap: "10px" }}>
          <button type="button" className="button button-ghost" onClick={() => navigate("/student/portfolio/experience/add")}>
            <ArrowLeft size={17} /> Back
          </button>
          <button type="submit" className="button button-primary" disabled={saving}>
            <Save size={18} /> {saving ? "Saving..." : "Save certificate"}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="portfolio-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowSuccessModal(false);
        }}>
          <section className="portfolio-success-modal" role="dialog" aria-modal="true" aria-labelledby="certificate-success-title">
            <button className="portfolio-modal-close" type="button" onClick={() => setShowSuccessModal(false)} aria-label="Close message"><X size={20} /></button>
            <span className="portfolio-success-icon"><CheckCircle2 size={30} /></span>
            <h2 id="certificate-success-title">Certificate saved successfully</h2>
            <p>Your certificate has been added to your portfolio. You can add another certificate or return to the main portfolio page.</p>
            <div className="portfolio-modal-actions portfolio-modal-actions-stacked-mobile">
              <button type="button" className="button button-ghost" onClick={() => setShowSuccessModal(false)}>Cancel</button>
              <button type="button" className="button button-secondary" onClick={addAnotherCertificate}><Plus size={17} /> Add another certificate</button>
              <button type="button" className="button button-primary" onClick={() => navigate("/student/portfolio")}>Finish portfolio details</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AddCertificate;
