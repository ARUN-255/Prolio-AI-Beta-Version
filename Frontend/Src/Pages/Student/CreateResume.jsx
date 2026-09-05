import { ArrowLeft, BriefcaseBusiness, FileText, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createResume, importResumeFromPortfolio } from "../../Services/resumeService";
import "../../Styles/resumes.css";

function CreateResume() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [usePortfolio, setUsePortfolio] = useState(true);
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give your resume a title.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      let resumeData = {};

      if (usePortfolio) {
        const imported = await importResumeFromPortfolio();
        resumeData = imported?.resume_data || imported?.data || imported?.resumeData || {};
      }

      const result = await createResume({
        title: title.trim(),
        template_name: "classic",
        resume_data: resumeData,
        is_primary: isPrimary,
        is_public: false,
      });

      const resumeId = result?.resume?.id;
      if (!resumeId) throw new Error("Resume was created but no resume id was returned.");
      navigate(`/student/resumes/${resumeId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to create the resume.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="resume-create-page">
      <button className="button button-ghost" type="button" onClick={() => navigate("/student/resumes")}>
        <ArrowLeft size={17} /> Back to resumes
      </button>

      <section className="resume-create-card">
        <div className="resume-create-heading">
          <span className="resumes-empty-icon"><FileText size={27} /></span>
          <div>
            <p className="eyebrow">New resume</p>
            <h1>Start your resume</h1>
            <p>Create a blank resume or bring in the professional details you already added to your portfolio.</p>
          </div>
        </div>

        {error && <div className="resumes-error">{error}</div>}

        <form onSubmit={handleCreate} className="resume-create-form">
          <label>
            Resume title
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Software Engineer Resume" maxLength={120} />
          </label>

          <div className="resume-start-options">
            <button className={`resume-start-option ${usePortfolio ? "selected" : ""}`} type="button" onClick={() => setUsePortfolio(true)}>
              <Sparkles size={21} />
              <strong>Use my portfolio</strong>
              <span>Import your saved profile, projects, education, skills and experience.</span>
            </button>
            <button className={`resume-start-option ${!usePortfolio ? "selected" : ""}`} type="button" onClick={() => setUsePortfolio(false)}>
              <BriefcaseBusiness size={21} />
              <strong>Start blank</strong>
              <span>Create an empty resume and add only the details you want.</span>
            </button>
          </div>

          <label className="resume-checkbox">
            <input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} />
            Make this my primary resume
          </label>

          <div className="resume-create-actions">
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? <><LoaderCircle className="spin" size={17} /> Creating...</> : "Create and continue"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateResume;
