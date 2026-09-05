import {
  ExternalLink,
  Github,
  Globe2,
  Linkedin,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
} from "../../Services/portfolioService";

const emptyForm = {
  headline: "",
  bio: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  isPublic: true,
};

function PortfolioMaker() {
  const [formData, setFormData] = useState(emptyForm);

  const [profileExists, setProfileExists] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getStudentProfile();

        if (data?.profile) {
          const profile = data.profile;

          setFormData({
            headline: profile.headline || "",
            bio: profile.bio || "",
            location: profile.location || "",
            website: profile.website || "",
            linkedin: profile.linkedin || "",
            github: profile.github || "",
            isPublic:
              typeof profile.is_public === "boolean"
                ? profile.is_public
                : typeof profile.isPublic === "boolean"
                  ? profile.isPublic
                  : true,
          });

          setProfileExists(true);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setProfileExists(false);
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load your portfolio profile."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        headline: formData.headline.trim() || null,
        bio: formData.bio.trim() || null,
        location: formData.location.trim() || null,
        website: formData.website.trim() || null,
        linkedin: formData.linkedin.trim() || null,
        github: formData.github.trim() || null,
        isPublic: formData.isPublic,

        /*
         * These fields are managed separately later.
         * Sending them as undefined prevents accidental
         * replacement of existing structured data.
         */
        education: undefined,
        skills: undefined,
        socialLinks: undefined,
      };

      let data;

      if (profileExists) {
        data = await updateStudentProfile(payload);
      } else {
        data = await createStudentProfile(payload);
        setProfileExists(true);
      }

      if (data?.profile) {
        setSuccess(
          profileExists
            ? "Portfolio profile updated successfully."
            : "Portfolio profile created successfully."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save your portfolio profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="portfolio-maker-page">
        <div className="portfolio-loading">
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-maker-page">
      <section className="portfolio-page-heading">
        <div>
          <p className="eyebrow">Portfolio</p>

          <h1>Build your professional profile</h1>

          <p>
            Add the main information that will appear on your
            portfolio and be used by other Prolio tools.
          </p>
        </div>
      </section>

      {error && (
        <div className="portfolio-message portfolio-message-error">
          {error}
        </div>
      )}

      {success && (
        <div className="portfolio-message portfolio-message-success">
          {success}
        </div>
      )}

      <form
        className="portfolio-profile-form"
        onSubmit={handleSubmit}
      >
        <section className="portfolio-form-card">
          <div className="portfolio-form-card-heading">
            <span className="portfolio-section-icon">
              <UserRound size={20} />
            </span>

            <div>
              <h2>Basic profile</h2>

              <p>
                Add a short headline and introduction about yourself.
              </p>
            </div>
          </div>

          <div className="portfolio-form-content">
            <div className="form-group">
              <label htmlFor="portfolio-headline">
                Professional headline
              </label>

              <input
                id="portfolio-headline"
                name="headline"
                type="text"
                value={formData.headline}
                onChange={handleChange}
                placeholder="Example: B.Tech IT Student | Software Developer"
                maxLength={160}
              />
            </div>

            <div className="form-group">
              <label htmlFor="portfolio-bio">About you</label>

              <textarea
                id="portfolio-bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Write a short introduction about yourself, your interests and what you are building."
                rows={6}
                maxLength={1000}
              />

              <span className="portfolio-character-count">
                {formData.bio.length}/1000
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="portfolio-location">
                Location
              </label>

              <div className="portfolio-input-icon">
                <MapPin size={18} />

                <input
                  id="portfolio-location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Example: Tamil Nadu, India"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="portfolio-form-card">
          <div className="portfolio-form-card-heading">
            <span className="portfolio-section-icon">
              <Globe2 size={20} />
            </span>

            <div>
              <h2>Links</h2>

              <p>
                Add websites and social profiles you want to show.
              </p>
            </div>
          </div>

          <div className="portfolio-form-content">
            <div className="form-group">
              <label htmlFor="portfolio-website">
                Website
              </label>

              <div className="portfolio-input-icon">
                <ExternalLink size={18} />

                <input
                  id="portfolio-website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="portfolio-linkedin">
                LinkedIn
              </label>

              <div className="portfolio-input-icon">
                <Linkedin size={18} />

                <input
                  id="portfolio-linkedin"
                  name="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="portfolio-github">
                GitHub
              </label>

              <div className="portfolio-input-icon">
                <Github size={18} />

                <input
                  id="portfolio-github"
                  name="github"
                  type="url"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="portfolio-form-card">
          <div className="portfolio-form-card-heading">
            <span className="portfolio-section-icon">
              <Globe2 size={20} />
            </span>

            <div>
              <h2>Portfolio visibility</h2>

              <p>
                Choose whether your portfolio can be viewed publicly.
              </p>
            </div>
          </div>

          <div className="portfolio-form-content">
            <label className="portfolio-visibility-option">
              <input
                name="isPublic"
                type="checkbox"
                checked={formData.isPublic}
                onChange={handleChange}
              />

              <span>
                <strong>Public portfolio</strong>

                <small>
                  Allow people with your portfolio link to view your
                  public professional information.
                </small>
              </span>
            </label>
          </div>
        </section>

        <div className="portfolio-form-actions">
          <button
            type="submit"
            className="button button-primary"
            disabled={saving}
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : profileExists
                ? "Save changes"
                : "Create profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PortfolioMaker;