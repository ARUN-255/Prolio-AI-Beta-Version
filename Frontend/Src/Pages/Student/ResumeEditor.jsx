import { ArrowDown, ArrowLeft, ArrowUp, Download, Eye, EyeOff, GripVertical, LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateResumePdf, getResumeById, getResumePdfUrl, updateResume } from "../../Services/resumeService";
import "../../Styles/resumes.css";

const DEFAULT_ORDER = ["summary", "experience", "projects", "education", "skills", "certificates"];
const LABELS = { summary: "Summary", experience: "Experience", projects: "Projects", education: "Education", skills: "Skills", certificates: "Certificates" };

function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [title, setTitle] = useState("");
  const [resumeData, setResumeData] = useState({});
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [draggedSection, setDraggedSection] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getResumeById(id);
        const loaded = data.resume;
        const loadedData = loaded?.resume_data || {};
        const existingOrder = Array.isArray(loadedData.section_order) ? loadedData.section_order : [];
        const order = [...existingOrder.filter((x) => DEFAULT_ORDER.includes(x)), ...DEFAULT_ORDER.filter((x) => !existingOrder.includes(x))];
        setResume(loaded);
        setTitle(loaded?.title || "");
        setResumeData({ ...loadedData, section_order: order, hidden_sections: loadedData.hidden_sections || [] });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load this resume.");
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const order = resumeData.section_order || DEFAULT_ORDER;
  const hidden = resumeData.hidden_sections || [];

  const updatePersonal = (key, value) => setResumeData((current) => ({ ...current, personal_info: { ...(current.personal_info || {}), [key]: value } }));
  const updateSummary = (value) => setResumeData((current) => ({ ...current, summary: value }));

  const moveSection = (name, direction) => {
    const currentIndex = order.indexOf(name);
    const target = currentIndex + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[currentIndex], next[target]] = [next[target], next[currentIndex]];
    setResumeData((current) => ({ ...current, section_order: next }));
  };

  const dropSection = (target) => {
    if (!draggedSection || draggedSection === target) return setDraggedSection(null);
    const next = order.filter((item) => item !== draggedSection);
    next.splice(next.indexOf(target), 0, draggedSection);
    setResumeData((current) => ({ ...current, section_order: next }));
    setDraggedSection(null);
  };

  const toggleSection = (name) => setResumeData((current) => {
    const currentHidden = current.hidden_sections || [];
    return { ...current, hidden_sections: currentHidden.includes(name) ? currentHidden.filter((item) => item !== name) : [...currentHidden, name] };
  });

  const handleSave = async () => {
    if (!resume || !title.trim()) return;
    try {
      setSaving(true); setError(""); setMessage("");
      const data = await updateResume(id, { title: title.trim(), template_name: resume.template_name || "classic", resume_data: resumeData, is_primary: Boolean(resume.is_primary), is_public: Boolean(resume.is_public) });
      setResume(data.resume);
      setResumeData(data.resume?.resume_data || resumeData);
      setMessage("Resume layout and content saved.");
    } catch (err) { setError(err.response?.data?.message || "Unable to save the resume."); }
    finally { setSaving(false); }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true); setError("");
      await handleSave();
      await generateResumePdf(id);
      const data = await getResumePdfUrl(id);
      const url = data?.url || data?.pdf_url || data?.signed_url;
      if (!url) throw new Error("PDF link was not returned.");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) { setError(err.response?.data?.message || err.message || "Unable to generate the PDF."); }
    finally { setDownloading(false); }
  };

  const personal = resumeData.personal_info || {};
  const visibleOrder = useMemo(() => order.filter((name) => !hidden.includes(name)), [order, hidden]);

  const renderSection = (name) => {
    if (name === "summary") return resumeData.summary ? <section><h2>Summary</h2><p>{resumeData.summary}</p></section> : null;
    const items = resumeData[name] || [];
    if (!Array.isArray(items) || items.length === 0) return null;
    return <section><h2>{LABELS[name]}</h2>{items.map((item, index) => <div className="resume-preview-entry" key={`${name}-${index}`}>
      {name === "skills" ? <p>{item.name}{item.proficiency ? ` · ${item.proficiency}` : ""}</p> : <><h3>{item.role || item.title || item.degree || item.institution}</h3><p>{item.company || item.issuer || item.institution || item.field_of_study || ""}</p>{item.description && <p>{item.description}</p>}{Array.isArray(item.tech_stack) && item.tech_stack.length > 0 && <small>{item.tech_stack.join(" · ")}</small>}</>}
    </div>)}</section>;
  };

  if (loading) return <div className="resumes-state"><LoaderCircle className="spin" size={24} /> Loading resume...</div>;
  if (error && !resume) return <div className="resumes-state"><p>{error}</p><button className="button button-primary" onClick={() => navigate("/student/resumes")}>Back to resumes</button></div>;

  return <div className="resume-editor-page">
    <div className="resume-editor-toolbar"><button className="button button-ghost" type="button" onClick={() => navigate("/student/resumes")}><ArrowLeft size={17}/> Resumes</button><div className="resume-editor-actions"><button className="button button-ghost" type="button" onClick={handleDownload} disabled={downloading}>{downloading ? <LoaderCircle className="spin" size={17}/> : <Download size={17}/>} PDF</button><button className="button button-primary" type="button" onClick={handleSave} disabled={saving}>{saving ? <LoaderCircle className="spin" size={17}/> : <Save size={17}/>} Save</button></div></div>
    {error && <div className="resumes-error">{error}</div>}{message && <div className="resumes-success">{message}</div>}
    <div className="resume-editor-layout">
      <aside className="resume-editor-panel">
        <p className="eyebrow">Resume editor</p>
        <label>Resume title<input value={title} onChange={(e) => setTitle(e.target.value)}/></label>
        <label>Headline<input value={personal.headline || ""} onChange={(e) => updatePersonal("headline", e.target.value)}/></label>
        <label>Location<input value={personal.location || ""} onChange={(e) => updatePersonal("location", e.target.value)}/></label>
        <label>Summary<textarea rows="5" value={resumeData.summary || ""} onChange={(e) => updateSummary(e.target.value)}/></label>
        <div><div className="resume-arrange-heading"><strong>Arrange sections</strong><small>Drag or use arrows</small></div><div className="resume-section-sorter">{order.map((name, index) => <div key={name} className={`resume-sort-item ${draggedSection === name ? "dragging" : ""}`} draggable onDragStart={() => setDraggedSection(name)} onDragOver={(e) => e.preventDefault()} onDrop={() => dropSection(name)}><GripVertical size={17}/><span>{LABELS[name]}</span><button type="button" title="Move up" disabled={index === 0} onClick={() => moveSection(name,-1)}><ArrowUp size={14}/></button><button type="button" title="Move down" disabled={index === order.length-1} onClick={() => moveSection(name,1)}><ArrowDown size={14}/></button><button type="button" title={hidden.includes(name) ? "Show section" : "Hide section"} onClick={() => toggleSection(name)}>{hidden.includes(name) ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div>)}</div></div>
      </aside>
      <section className="resume-document-preview"><div className="resume-paper"><h1>{personal.name || "Your Name"}</h1><p className="resume-paper-headline">{personal.headline || "Professional headline"}</p>{personal.location && <p className="resume-paper-contact">{personal.location}</p>}<div className="resume-paper-sections">{visibleOrder.map((name) => <div key={name}>{renderSection(name)}</div>)}</div></div></section>
    </div>
  </div>;
}

export default ResumeEditor;
