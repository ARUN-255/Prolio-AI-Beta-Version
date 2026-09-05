import { ArrowLeft, Download, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateResumePdf, getResumeById, getResumePdfUrl, updateResume } from "../../Services/resumeService";
import "../../Styles/resumes.css";

function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getResumeById(id);
        setResume(data.resume);
        setTitle(data.resume?.title || "");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load this resume.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!resume || !title.trim()) return;
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const data = await updateResume(id, {
        title: title.trim(),
        template_name: resume.template_name || "classic",
        resume_data: resume.resume_data || {},
        is_primary: Boolean(resume.is_primary),
        is_public: Boolean(resume.is_public),
      });
      setResume(data.resume);
      setMessage("Resume saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save the resume.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError("");
      await generateResumePdf(id);
      const data = await getResumePdfUrl(id);
      const url = data?.url || data?.pdf_url || data?.signed_url;
      if (!url) throw new Error("PDF link was not returned.");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to generate the PDF.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="resumes-state"><LoaderCircle className="spin" size={24} /> Loading resume...</div>;
  if (error && !resume) return <div className="resumes-state"><p>{error}</p><button className="button button-primary" onClick={() => navigate("/student/resumes")}>Back to resumes</button></div>;

  const data = resume?.resume_data || {};
  const sectionNames = Object.keys(data);

  return (
    <div className="resume-editor-page">
      <div className="resume-editor-toolbar">
        <button className="button button-ghost" type="button" onClick={() => navigate("/student/resumes")}><ArrowLeft size={17} /> Resumes</button>
        <div className="resume-editor-actions">
          <button className="button button-ghost" type="button" onClick={handleDownload} disabled={downloading}>{downloading ? <LoaderCircle className="spin" size={17} /> : <Download size={17} />} PDF</button>
          <button className="button button-primary" type="button" onClick={handleSave} disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />} Save</button>
        </div>
      </div>

      {error && <div className="resumes-error">{error}</div>}
      {message && <div className="resumes-success">{message}</div>}

      <div className="resume-editor-layout">
        <aside className="resume-editor-panel">
          <p className="eyebrow">Resume settings</p>
          <label>Resume title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <div className="resume-editor-meta"><span>Template</span><strong>{resume?.template_name || "classic"}</strong></div>
          <div className="resume-editor-meta"><span>Imported sections</span><strong>{sectionNames.length}</strong></div>
          <p className="resume-editor-note">The next step will turn these imported sections into editable resume fields and add template selection.</p>
        </aside>

        <section className="resume-document-preview">
          <div className="resume-paper">
            <h1>{data.personal_info?.name || data.personalInfo?.name || "Your Name"}</h1>
            <p className="resume-paper-headline">{data.personal_info?.headline || data.personalInfo?.headline || "Professional headline"}</p>
            {data.summary && <p className="resume-paper-summary">{data.summary}</p>}
            {sectionNames.length === 0 ? (
              <div className="resume-paper-empty">This resume is blank. Editable sections are coming in the next resume-builder step.</div>
            ) : (
              <div className="resume-paper-sections">
                {sectionNames.filter((name) => !["personal_info", "personalInfo", "summary"].includes(name)).map((name) => (
                  <section key={name}>
                    <h2>{name.replaceAll("_", " ")}</h2>
                    <p>{Array.isArray(data[name]) ? `${data[name].length} item${data[name].length === 1 ? "" : "s"}` : "Information imported"}</p>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResumeEditor;
