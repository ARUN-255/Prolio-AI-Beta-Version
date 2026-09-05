import {
  FilePlus2,
  FileText,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteResume, getResumes } from "../../Services/resumeService";
import "../../Styles/resumes.css";

function Resumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getResumes();
      setResumes(data?.resumes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this resume? This cannot be undone.");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      await deleteResume(id);
      setResumes((current) => current.filter((resume) => resume.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete the resume.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="resumes-page">
      <section className="resumes-heading">
        <div>
          <p className="eyebrow">Resume maker</p>
          <h1>Your resumes</h1>
          <p>Create different resumes for internships, placements and job applications.</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => navigate("/student/resumes/new")}>
          <Plus size={18} /> Create resume
        </button>
      </section>

      {error && <div className="resumes-error">{error}</div>}

      {loading ? (
        <div className="resumes-state"><LoaderCircle className="spin" size={24} /> Loading resumes...</div>
      ) : resumes.length === 0 ? (
        <section className="resumes-empty">
          <span className="resumes-empty-icon"><FilePlus2 size={30} /></span>
          <h2>Create your first resume</h2>
          <p>You can start with your portfolio information so you do not need to enter the same details again.</p>
          <button className="button button-primary" type="button" onClick={() => navigate("/student/resumes/new")}>
            <Plus size={18} /> Build a resume
          </button>
        </section>
      ) : (
        <section className="resumes-grid">
          {resumes.map((resume) => (
            <article className="resume-card" key={resume.id}>
              <div className="resume-card-top">
                <span className="resume-card-icon"><FileText size={22} /></span>
                <div className="resume-card-badges">
                  {resume.is_primary && <span>Primary</span>}
                  {resume.is_public && <span>Public</span>}
                </div>
              </div>
              <h2>{resume.title}</h2>
              <p>Template: {resume.template_name || "Classic"}</p>
              <small>Updated {resume.updated_at ? new Date(resume.updated_at).toLocaleDateString() : "recently"}</small>
              <div className="resume-card-actions">
                <button className="button button-primary" type="button" onClick={() => navigate(`/student/resumes/${resume.id}`)}>Open resume</button>
                <button className="resume-delete-button" type="button" aria-label={`Delete ${resume.title}`} disabled={deletingId === resume.id} onClick={() => handleDelete(resume.id)}>
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default Resumes;
