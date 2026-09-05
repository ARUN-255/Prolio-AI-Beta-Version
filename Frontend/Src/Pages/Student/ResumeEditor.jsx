import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Download,
  Eye,
  EyeOff,
  GripVertical,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  generateResumePdf,
  getResumeById,
  getResumePdfUrl,
  updateResume,
} from "../../Services/resumeService";
import "../../Styles/resumes.css";

const DEFAULT_ORDER = [
  "summary",
  "experience",
  "projects",
  "education",
  "skills",
  "certificates",
];

const LABELS = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certificates: "Certificates",
};

const EMPTY_ITEMS = {
  experience: {
    role: "",
    company: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  },
  projects: {
    title: "",
    description: "",
    tech_stack: [],
    link: "",
  },
  education: {
    degree: "",
    institution: "",
    field_of_study: "",
    start_year: "",
    end_year: "",
    grade: "",
    description: "",
  },
  skills: {
    name: "",
    category: "",
    proficiency: "",
  },
  certificates: {
    title: "",
    issuer: "",
    date: "",
    file_url: "",
  },
};

function Editable({
  value,
  onChange,
  className = "",
  multiline = false,
  placeholder = "Click to edit",
  type = "text",
}) {
  const props = {
    className: `resume-inline-edit ${className}`,
    value: value ?? "",
    onChange: (event) => onChange(event.target.value),
    placeholder,
    spellCheck: true,
  };

  return multiline ? (
    <textarea {...props} rows="2" />
  ) : (
    <input {...props} type={type} />
  );
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
        const existingOrder = Array.isArray(loadedData.section_order)
          ? loadedData.section_order
          : [];
        const order = [
          ...existingOrder.filter((item) => DEFAULT_ORDER.includes(item)),
          ...DEFAULT_ORDER.filter((item) => !existingOrder.includes(item)),
        ];

        setResume(loaded);
        setTitle(loaded?.title || "");
        setResumeData({
          ...loadedData,
          section_order: order,
          hidden_sections: Array.isArray(loadedData.hidden_sections)
            ? loadedData.hidden_sections
            : [],
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load this resume."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const order = resumeData.section_order || DEFAULT_ORDER;
  const hidden = resumeData.hidden_sections || [];
  const personal = resumeData.personal_info || {};

  const updatePersonal = (key, value) => {
    setResumeData((current) => ({
      ...current,
      personal_info: {
        ...(current.personal_info || {}),
        [key]: value,
      },
    }));
  };

  const updateSummary = (value) => {
    setResumeData((current) => ({ ...current, summary: value }));
  };

  const updateItem = (section, index, key, value) => {
    setResumeData((current) => {
      const items = [...(current[section] || [])];
      items[index] = { ...items[index], [key]: value };
      return { ...current, [section]: items };
    });
  };

  const addItem = (section) => {
    if (!EMPTY_ITEMS[section]) return;
    setResumeData((current) => ({
      ...current,
      [section]: [
        ...(current[section] || []),
        { ...EMPTY_ITEMS[section] },
      ],
    }));
  };

  const removeItem = (section, index) => {
    setResumeData((current) => ({
      ...current,
      [section]: (current[section] || []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const moveItem = (section, index, direction) => {
    setResumeData((current) => {
      const items = [...(current[section] || [])];
      const target = index + direction;
      if (target < 0 || target >= items.length) return current;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, [section]: items };
    });
  };

  const moveSection = (name, direction) => {
    const currentIndex = order.indexOf(name);
    const target = currentIndex + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[currentIndex], next[target]] = [next[target], next[currentIndex]];
    setResumeData((current) => ({ ...current, section_order: next }));
  };

  const dropSection = (target) => {
    if (!draggedSection || draggedSection === target) {
      setDraggedSection(null);
      return;
    }

    const next = order.filter((item) => item !== draggedSection);
    next.splice(next.indexOf(target), 0, draggedSection);
    setResumeData((current) => ({ ...current, section_order: next }));
    setDraggedSection(null);
  };

  const toggleSection = (name) => {
    setResumeData((current) => {
      const currentHidden = current.hidden_sections || [];
      return {
        ...current,
        hidden_sections: currentHidden.includes(name)
          ? currentHidden.filter((item) => item !== name)
          : [...currentHidden, name],
      };
    });
  };

  const saveResume = async ({ showMessage = true } = {}) => {
    if (!resume || !title.trim()) return null;

    try {
      setSaving(true);
      setError("");
      if (showMessage) setMessage("");

      const data = await updateResume(id, {
        title: title.trim(),
        template_name: resume.template_name || "classic",
        resume_data: resumeData,
        is_primary: Boolean(resume.is_primary),
        is_public: Boolean(resume.is_public),
      });

      setResume(data.resume);
      setResumeData(data.resume?.resume_data || resumeData);
      if (showMessage) setMessage("Resume saved successfully.");
      return data.resume;
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save the resume.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError("");
      await saveResume({ showMessage: false });
      await generateResumePdf(id);
      const data = await getResumePdfUrl(id);
      const url = data?.url || data?.pdf_url || data?.signed_url;
      if (!url) throw new Error("PDF link was not returned.");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate the PDF."
      );
    } finally {
      setDownloading(false);
    }
  };

  const visibleOrder = useMemo(
    () => order.filter((name) => !hidden.includes(name)),
    [order, hidden]
  );

  const entryActions = (section, index, count) => (
    <div className="resume-entry-actions">
      <button
        type="button"
        title="Move entry up"
        disabled={index === 0}
        onClick={() => moveItem(section, index, -1)}
      >
        <ArrowUp size={13} />
      </button>
      <button
        type="button"
        title="Move entry down"
        disabled={index === count - 1}
        onClick={() => moveItem(section, index, 1)}
      >
        <ArrowDown size={13} />
      </button>
      <button
        type="button"
        className="danger"
        title="Remove entry"
        onClick={() => removeItem(section, index)}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );

  const renderSection = (name) => {
    if (name === "summary") {
      return (
        <section>
          <h2>Summary</h2>
          <Editable
            multiline
            value={resumeData.summary}
            onChange={updateSummary}
            className="resume-inline-paragraph"
            placeholder="Write your professional summary"
          />
        </section>
      );
    }

    const items = Array.isArray(resumeData[name]) ? resumeData[name] : [];

    return (
      <section>
        <div className="resume-section-title-row">
          <h2>{LABELS[name]}</h2>
          <button
            type="button"
            className="resume-add-entry"
            onClick={() => addItem(name)}
          >
            <Plus size={13} /> Add
          </button>
        </div>

        {items.length === 0 && (
          <button
            type="button"
            className="resume-empty-section"
            onClick={() => addItem(name)}
          >
            <Plus size={15} /> Add your first {LABELS[name].toLowerCase()} entry
          </button>
        )}

        {items.map((item, index) => (
          <div className="resume-preview-entry" key={`${name}-${index}`}>
            {entryActions(name, index, items.length)}

            {name === "skills" && (
              <>
                <div className="resume-inline-row resume-inline-row-3">
                  <Editable
                    value={item.name}
                    onChange={(value) => updateItem(name, index, "name", value)}
                    placeholder="Skill"
                  />
                  <Editable
                    value={item.category}
                    onChange={(value) =>
                      updateItem(name, index, "category", value)
                    }
                    placeholder="Category"
                  />
                  <Editable
                    value={item.proficiency}
                    onChange={(value) =>
                      updateItem(name, index, "proficiency", value)
                    }
                    placeholder="Proficiency"
                  />
                </div>
              </>
            )}

            {name === "experience" && (
              <>
                <Editable
                  className="resume-inline-heading"
                  value={item.role}
                  onChange={(value) => updateItem(name, index, "role", value)}
                  placeholder="Role"
                />
                <Editable
                  value={item.company}
                  onChange={(value) =>
                    updateItem(name, index, "company", value)
                  }
                  placeholder="Company"
                />
                <div className="resume-inline-row">
                  <Editable
                    type="date"
                    value={item.start_date ? String(item.start_date).slice(0, 10) : ""}
                    onChange={(value) =>
                      updateItem(name, index, "start_date", value)
                    }
                    placeholder="Start date"
                  />
                  {item.is_current ? (
                    <div className="resume-current-label">Present</div>
                  ) : (
                    <Editable
                      type="date"
                      value={item.end_date ? String(item.end_date).slice(0, 10) : ""}
                      onChange={(value) =>
                        updateItem(name, index, "end_date", value)
                      }
                      placeholder="End date"
                    />
                  )}
                </div>
                <label className="resume-inline-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(item.is_current)}
                    onChange={(event) => {
                      updateItem(name, index, "is_current", event.target.checked);
                      if (event.target.checked) {
                        updateItem(name, index, "end_date", "");
                      }
                    }}
                  />
                  Currently working here
                </label>
                <Editable
                  multiline
                  value={item.description}
                  onChange={(value) =>
                    updateItem(name, index, "description", value)
                  }
                  placeholder="Describe your work and impact"
                />
              </>
            )}

            {name === "projects" && (
              <>
                <Editable
                  className="resume-inline-heading"
                  value={item.title}
                  onChange={(value) => updateItem(name, index, "title", value)}
                  placeholder="Project title"
                />
                <Editable
                  multiline
                  value={item.description}
                  onChange={(value) =>
                    updateItem(name, index, "description", value)
                  }
                  placeholder="Project description"
                />
                <Editable
                  value={Array.isArray(item.tech_stack) ? item.tech_stack.join(", ") : item.tech_stack}
                  onChange={(value) =>
                    updateItem(
                      name,
                      index,
                      "tech_stack",
                      value
                        .split(",")
                        .map((part) => part.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="React, Node.js, PostgreSQL"
                />
                <Editable
                  value={item.link}
                  onChange={(value) => updateItem(name, index, "link", value)}
                  placeholder="Project link"
                />
              </>
            )}

            {name === "education" && (
              <>
                <Editable
                  className="resume-inline-heading"
                  value={item.degree}
                  onChange={(value) => updateItem(name, index, "degree", value)}
                  placeholder="Degree"
                />
                <Editable
                  value={item.institution}
                  onChange={(value) =>
                    updateItem(name, index, "institution", value)
                  }
                  placeholder="Institution"
                />
                <Editable
                  value={item.field_of_study}
                  onChange={(value) =>
                    updateItem(name, index, "field_of_study", value)
                  }
                  placeholder="Field of study"
                />
                <div className="resume-inline-row resume-inline-row-3">
                  <Editable
                    value={item.start_year}
                    onChange={(value) =>
                      updateItem(name, index, "start_year", value)
                    }
                    placeholder="Start year"
                  />
                  <Editable
                    value={item.end_year}
                    onChange={(value) =>
                      updateItem(name, index, "end_year", value)
                    }
                    placeholder="End year"
                  />
                  <Editable
                    value={item.grade}
                    onChange={(value) => updateItem(name, index, "grade", value)}
                    placeholder="Grade / CGPA"
                  />
                </div>
                <Editable
                  multiline
                  value={item.description}
                  onChange={(value) =>
                    updateItem(name, index, "description", value)
                  }
                  placeholder="Education details or achievements"
                />
              </>
            )}

            {name === "certificates" && (
              <>
                <Editable
                  className="resume-inline-heading"
                  value={item.title}
                  onChange={(value) => updateItem(name, index, "title", value)}
                  placeholder="Certificate"
                />
                <Editable
                  value={item.issuer}
                  onChange={(value) => updateItem(name, index, "issuer", value)}
                  placeholder="Issuer"
                />
                <Editable
                  type="date"
                  value={item.date ? String(item.date).slice(0, 10) : ""}
                  onChange={(value) => updateItem(name, index, "date", value)}
                  placeholder="Date"
                />
                <Editable
                  value={item.file_url}
                  onChange={(value) =>
                    updateItem(name, index, "file_url", value)
                  }
                  placeholder="Credential link"
                />
              </>
            )}
          </div>
        ))}
      </section>
    );
  };

  if (loading) {
    return (
      <div className="resumes-state">
        <LoaderCircle className="spin" size={24} /> Loading resume...
      </div>
    );
  }

  if (error && !resume) {
    return (
      <div className="resumes-state">
        <p>{error}</p>
        <button
          className="button button-primary"
          onClick={() => navigate("/student/resumes")}
        >
          Back to resumes
        </button>
      </div>
    );
  }

  return (
    <div className="resume-editor-page">
      <div className="resume-editor-toolbar">
        <button
          className="button button-ghost"
          type="button"
          onClick={() => navigate("/student/resumes")}
        >
          <ArrowLeft size={17} /> Resumes
        </button>

        <div className="resume-editor-actions">
          <button
            className="button button-ghost"
            type="button"
            onClick={handleDownload}
            disabled={downloading || saving}
          >
            {downloading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Download size={17} />
            )}
            PDF
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => saveResume()}
            disabled={saving || downloading}
          >
            {saving ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Save size={17} />
            )}
            Save
          </button>
        </div>
      </div>

      {error && <div className="resumes-error">{error}</div>}
      {message && <div className="resumes-success">{message}</div>}

      <div className="resume-editor-layout">
        <aside className="resume-editor-panel">
          <p className="eyebrow">Resume editor</p>
          <label>
            Resume title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <div className="resume-setting-toggles">
            <label className="resume-setting-toggle">
              <input
                type="checkbox"
                checked={Boolean(resume?.is_primary)}
                onChange={(event) =>
                  setResume((current) => ({
                    ...current,
                    is_primary: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>Primary resume</strong>
                <small>Use this as your main resume.</small>
              </span>
            </label>

            <label className="resume-setting-toggle">
              <input
                type="checkbox"
                checked={Boolean(resume?.is_public)}
                onChange={(event) =>
                  setResume((current) => ({
                    ...current,
                    is_public: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>Public resume</strong>
                <small>Allow this resume to be shared publicly.</small>
              </span>
            </label>
          </div>

          <p className="resume-editor-note">
            Click directly on any resume text to edit it. Add, delete or
            rearrange entries inside the document. Use this panel to arrange
            whole sections.
          </p>

          <div>
            <div className="resume-arrange-heading">
              <strong>Arrange sections</strong>
              <small>Drag or use arrows</small>
            </div>
            <div className="resume-section-sorter">
              {order.map((name, index) => (
                <div
                  key={name}
                  className={`resume-sort-item ${
                    draggedSection === name ? "dragging" : ""
                  }`}
                  draggable
                  onDragStart={() => setDraggedSection(name)}
                  onDragEnd={() => setDraggedSection(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropSection(name)}
                >
                  <GripVertical size={17} />
                  <span>{LABELS[name]}</span>
                  <button
                    type="button"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => moveSection(name, -1)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={index === order.length - 1}
                    onClick={() => moveSection(name, 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    title={hidden.includes(name) ? "Show section" : "Hide section"}
                    onClick={() => toggleSection(name)}
                  >
                    {hidden.includes(name) ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="resume-document-preview">
          <div className="resume-paper resume-paper-editable">
            <Editable
              className="resume-inline-name"
              value={personal.name}
              onChange={(value) => updatePersonal("name", value)}
              placeholder="Your Name"
            />
            <Editable
              className="resume-inline-headline"
              value={personal.headline}
              onChange={(value) => updatePersonal("headline", value)}
              placeholder="Professional headline"
            />

            <div className="resume-contact-editor">
              <Editable
                className="resume-inline-contact"
                value={personal.location}
                onChange={(value) => updatePersonal("location", value)}
                placeholder="Location"
              />
              <Editable
                className="resume-inline-contact"
                value={personal.website}
                onChange={(value) => updatePersonal("website", value)}
                placeholder="Website"
              />
              <Editable
                className="resume-inline-contact"
                value={personal.linkedin}
                onChange={(value) => updatePersonal("linkedin", value)}
                placeholder="LinkedIn"
              />
              <Editable
                className="resume-inline-contact"
                value={personal.github}
                onChange={(value) => updatePersonal("github", value)}
                placeholder="GitHub"
              />
            </div>

            <div className="resume-paper-sections">
              {visibleOrder.map((name) => (
                <div key={name}>{renderSection(name)}</div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResumeEditor;
