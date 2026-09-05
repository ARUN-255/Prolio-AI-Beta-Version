import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  LoaderCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { deleteAtsAnalysis, getAtsAnalyses, runAtsAnalysis } from "../../Services/atsService";
import { getResumes } from "../../Services/resumeService";
import "../../Styles/ats.css";

const asArray = (value) => (Array.isArray(value) ? value : []);

const normalizeAiFeedback = (feedback) => {
  if (!feedback) return null;
  if (typeof feedback === "object") return feedback;
  if (typeof feedback !== "string") return null;

  try {
    return JSON.parse(feedback);
  } catch {
    return { summary: feedback, strengths: [], improvements: [], recommended_keywords: [] };
  }
};

function ATSChecker() {
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [resumeResponse, analysisResponse] = await Promise.all([getResumes(), getAtsAnalyses()]);
        const loadedResumes = resumeResponse?.resumes || [];
        setResumes(loadedResumes);
        setAnalyses(analysisResponse?.analyses || []);
        if (loadedResumes.length > 0) setSelectedResume(String(loadedResumes[0].id));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load ATS checker.");
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const selectedResumeData = useMemo(
    () => resumes.find((resume) => String(resume.id) === String(selectedResume)),
    [resumes, selectedResume]
  );

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!selectedResume) return setError("Choose a resume first.");
    if (!jobDescription.trim()) return setError("Paste the job description before analyzing.");

    try {
      setAnalyzing(true); setError("");
      const data = await runAtsAnalysis({ resume_id: Number(selectedResume), job_title: jobTitle.trim() || null, job_description: jobDescription.trim() });
      setResult(data.analysis);
      setQuota(data.quota || null);
      setAnalyses((current) => [data.analysis, ...current]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to run ATS analysis.");
    } finally { setAnalyzing(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ATS analysis?")) return;
    try {
      await deleteAtsAnalysis(id);
      setAnalyses((current) => current.filter((item) => item.id !== id));
      if (result?.id === id) setResult(null);
    } catch (err) { setError(err.response?.data?.message || "Unable to delete this ATS analysis."); }
  };

  const renderTags = (items, type) => {
    const list = asArray(items);
    if (list.length === 0) return <span className="ats-empty-text">None</span>;
    return <div className="ats-tags">{list.map((item, index) => <span className={`ats-tag ${type}`} key={`${item}-${index}`}>{String(item)}</span>)}</div>;
  };

  const renderAiFeedback = (feedback) => {
    const ai = normalizeAiFeedback(feedback);
    if (!ai) return null;

    return (
      <article className="ats-ai-card">
        <div className="ats-card-heading"><span className="ats-icon"><Sparkles size={19} /></span><div><h3>AI feedback</h3><p>Additional guidance based on the job description.</p></div></div>
        {ai.summary && <div className="ats-ai-summary"><h4>Overview</h4><p>{ai.summary}</p></div>}
        <div className="ats-ai-grid">
          {asArray(ai.strengths).length > 0 && <div><h4>What works well</h4><ul>{asArray(ai.strengths).map((item, index) => <li key={index}>{String(item)}</li>)}</ul></div>}
          {asArray(ai.improvements).length > 0 && <div><h4>What to improve</h4><ul>{asArray(ai.improvements).map((item, index) => <li key={index}>{String(item)}</li>)}</ul></div>}
        </div>
        {asArray(ai.recommended_keywords).length > 0 && <div className="ats-ai-keywords"><h4>Recommended keywords</h4>{renderTags(ai.recommended_keywords, "good")}</div>}
      </article>
    );
  };

  if (loading) return <div className="ats-state"><LoaderCircle className="spin" size={24} /> Loading ATS checker...</div>;

  return (
    <div className="ats-page">
      <section className="ats-page-heading"><div><p className="eyebrow">ATS checker</p><h1>Match your resume to a job</h1><p>Choose one of your resumes, paste the job description and see what matches and what needs improvement.</p></div></section>
      {error && <div className="resumes-error">{error}</div>}
      <div className="ats-layout">
        <form className="ats-input-card" onSubmit={handleAnalyze}>
          <div className="ats-card-heading"><span className="ats-icon"><FileCheck2 size={21} /></span><div><h2>New analysis</h2><p>Compare one saved resume with a job description.</p></div></div>
          {resumes.length === 0 ? <div className="ats-no-resume">Create a resume first before running an ATS check.</div> : <>
            <label>Resume<select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)}>{resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.title}</option>)}</select></label>
            {selectedResumeData && <small className="ats-selected-note">Using: {selectedResumeData.title}</small>}
            <label>Job title <span>optional</span><input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer Intern" /></label>
            <label>Job description<textarea rows="13" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the complete job description here..." /></label>
            <button className="button button-primary" type="submit" disabled={analyzing}>{analyzing ? <><LoaderCircle className="spin" size={17} /> Analyzing...</> : <><Sparkles size={17} /> Analyze resume</>}</button>
          </>}
        </form>
        <section className="ats-result-card">
          {!result ? <div className="ats-result-empty"><FileCheck2 size={34} /><h2>Your result will appear here</h2><p>Run an analysis to see the ATS score, keyword gaps, strengths and improvements.</p></div> : <>
            <div className="ats-score-row"><div className="ats-score-circle"><strong>{result.ats_score ?? 0}</strong><span>/100</span></div><div><p className="eyebrow">ATS match</p><h2>{result.job_title || "Job analysis"}</h2>{quota && <p className="ats-quota">Checks used: {quota.used}{quota.unlimited ? " · Unlimited" : ` / ${quota.limit}`}</p>}</div></div>
            <div className="ats-result-grid"><article><h3><CheckCircle2 size={17} /> Matched skills</h3>{renderTags(result.matched_skills, "good")}</article><article><h3><AlertCircle size={17} /> Missing skills</h3>{renderTags(result.missing_skills, "missing")}</article><article><h3>Matched keywords</h3>{renderTags(result.matched_keywords, "good")}</article><article><h3>Missing keywords</h3>{renderTags(result.missing_keywords, "missing")}</article></div>
            <div className="ats-text-sections"><article><h3>Strengths</h3>{asArray(result.strengths).length ? <ul>{asArray(result.strengths).map((item, index) => <li key={index}>{String(item)}</li>)}</ul> : <p>No strengths returned.</p>}</article><article><h3>Improvements</h3>{asArray(result.improvements).length ? <ul>{asArray(result.improvements).map((item, index) => <li key={index}>{String(item)}</li>)}</ul> : <p>No improvements returned.</p>}</article></div>
            {renderAiFeedback(result.ai_feedback)}
          </>}
        </section>
      </div>
      <section className="ats-history-card"><div className="ats-history-heading"><div><h2>Previous analyses</h2><p>Your recent ATS checks are saved here.</p></div></div>{analyses.length === 0 ? <div className="ats-history-empty">No ATS analyses yet.</div> : <div className="ats-history-list">{analyses.map((analysis) => <article key={analysis.id} className="ats-history-item"><button className="ats-history-main" type="button" onClick={() => setResult(analysis)}><span className="ats-history-score">{analysis.ats_score ?? 0}</span><div><h3>{analysis.job_title || "Untitled job"}</h3><p>{analysis.created_at ? new Date(analysis.created_at).toLocaleDateString() : "Saved analysis"}</p></div></button><button className="ats-history-delete" type="button" onClick={() => handleDelete(analysis.id)} aria-label="Delete ATS analysis"><Trash2 size={17} /></button></article>)}</div>}</section>
    </div>
  );
}

export default ATSChecker;
