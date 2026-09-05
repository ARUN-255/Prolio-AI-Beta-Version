import { ArrowDown, ArrowLeft, ArrowUp, Download, Eye, EyeOff, GripVertical, LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateResumePdf, getResumeById, getResumePdfUrl, updateResume } from "../../Services/resumeService";
import "../../Styles/resumes.css";

const DEFAULT_ORDER = ["summary", "experience", "projects", "education", "skills", "certificates"];
const LABELS = { summary: "Summary", experience: "Experience", projects: "Projects", education: "Education", skills: "Skills", certificates: "Certificates" };

function Editable({ value, onChange, className = "", multiline = false, placeholder = "Click to edit" }) {
  const props = {
    className: `resume-inline-edit ${className}`,
    value: value || "",
    onChange: (e) => onChange(e.target.value),
    placeholder,
    spellCheck: true,
  };

  return multiline ? <textarea {...props} rows="2" /> : <input {...props} />;
}

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
  const personal = resumeData.personal_info || {};

  const updatePersonal = (key, value) => setResumeData((current) => ({ ...current, personal_info: { ...(current.personal_info || {}), [key]: value } }));
  const updateSummary = (value) => setResumeData((current) => ({ ...current, summary: value }));
  const updateItem = (section, index, key, value) => setResumeData((current) => {
    const items = [...(current[section] || [])];
    items[index] = { ...items[index], [key]: value };
    return { ...current, [section]: items };
  });

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

  const visibleOrder = useMemo(() => order.filter((name) => !hidden.includes(name)), [order, hidden]);

  const renderSection = (name) => {
    if (name === "summary") return <section><h2>Summary</h2><Editable multiline value={resumeData.summary} onChange={updateSummary} className="resume-inline-paragraph" placeholder="Write your professional summary" /></section>;
    const items = resumeData[name] || [];
    if (!Array.isArray(items) || items.length === 0) return null;

    return <section><h2>{LABELS[name]}</h2>{items.map((item, index) => <div className="resume-preview-entry" key={`${name}-${index}`}>
      {name === "skills" ? <div className="resume-inline-row"><Editable value={item.name} onChange={(v) => updateItem(name,index,"name",v)} placeholder="Skill" />{item.proficiency !== undefined && <Editable value={item.proficiency} onChange={(v) => updateItem(name,index,"proficiency",v)} placeholder="Proficiency" />}</div> : <>
        {name === "experience" && <><Editable className="resume-inline-heading" value={item.role} onChange={(v) => updateItem(name,index,"role",v)} placeholder="Role"/><Editable value={item.company} onChange={(v) => updateItem(name,index,"company",v)} placeholder="Company"/></>}
        {name === "projects" && <><Editable className="resume-inline-heading" value={item.title} onChange={(v) => updateItem(name,index,"title",v)} placeholder="Project title"/><Editable multiline value={item.description} onChange={(v) => updateItem(name,index,"description",v)} placeholder="Project description"/></>}
        {name === "education" && <><Editable className="resume-inline-heading" value={item.degree} onChange={(v) => updateItem(name,index,"degree",v)} placeholder="Degree"/><Editable value={item.institution} onChange={(v) => updateItem(name,index,"institution",v)} placeholder="Institution"/><Editable value={item.field_of_study} onChange={(v) => updateItem(name,index,"field_of_study",v)} placeholder="Field of study"/></>}
        {name === "certificates" && <><Editable className="resume-inline-heading" value={item.title} onChange={(v) => updateItem(name,index,"title",v)} placeholder="Certificate"/><Editable value={item.issuer} onChange={(v) => updateItem(name,index,"issuer",v)} placeholder="Issuer"/></>}
        {name === "experience" && <Editable multiline value={item.description} onChange={(v) => updateItem(name,index,"description",v)} placeholder="Describe your work"/>}
        {name === "projects" && Array.isArray(item.tech_stack) && <Editable value={item.tech_stack.join(", ")} onChange={(v) => updateItem(name,index,"tech_stack",v.split(",").map((x)=>x.trim()).filter(Boolean))} placeholder="React, Node.js, PostgreSQL"/>}
      </>}
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
        <p className="resume-editor-note">Edit the resume by clicking directly on its text. Use this panel to arrange or hide sections.</p>
        <div><div className="resume-arrange-heading"><strong>Arrange sections</strong><small>Drag or use arrows</small></div><div className="resume-section-sorter">{order.map((name, index) => <div key={name} className={`resume-sort-item ${draggedSection === name ? "dragging" : ""}`} draggable onDragStart={() => setDraggedSection(name)} onDragOver={(e) => e.preventDefault()} onDrop={() => dropSection(name)}><GripVertical size={17}/><span>{LABELS[name]}</span><button type="button" title="Move up" disabled={index === 0} onClick={() => moveSection(name,-1)}><ArrowUp size={14}/></button><button type="button" title="Move down" disabled={index === order.length-1} onClick={() => moveSection(name,1)}><ArrowDown size={14}/></button><button type="button" title={hidden.includes(name) ? "Show section" : "Hide section"} onClick={() => toggleSection(name)}>{hidden.includes(name) ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div>)}</div></div>
      </aside>
      <section className="resume-document-preview"><div className="resume-paper resume-paper-editable"><Editable className="resume-inline-name" value={personal.name} onChange={(v) => updatePersonal("name",v)} placeholder="Your Name"/><Editable className="resume-inline-headline" value={personal.headline} onChange={(v) => updatePersonal("headline",v)} placeholder="Professional headline"/><Editable className="resume-inline-contact" value={personal.location} onChange={(v) => updatePersonal("location",v)} placeholder="Location"/><div className="resume-paper-sections">{visibleOrder.map((name) => <div key={name}>{renderSection(name)}</div>)}</div></div></section>
    </div>
  </div>;
}

export default ResumeEditor;
