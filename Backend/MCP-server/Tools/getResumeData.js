const path = require("path");

const Resume = require(
  path.join(
    __dirname,
    "../../Src/Models/Resume"
  )
);

const getResumeData = async ({
  resumeId,
}) => {
  const resume =
    await Resume.findPublicById(
      resumeId
    );

  if (!resume) {
    throw new Error(
      "Public resume not found"
    );
  }

  return {
    id: resume.id,
    title: resume.title,
    template_name:
      resume.template_name,
    resume_data:
      resume.resume_data,
    is_primary:
      resume.is_primary,
    is_public:
      resume.is_public,
    pdf_url:
      resume.pdf_url,
    created_at:
      resume.created_at,
    updated_at:
      resume.updated_at,
  };
};

module.exports = {
  getResumeData,
};