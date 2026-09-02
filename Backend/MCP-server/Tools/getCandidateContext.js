const path = require("path");

const User = require(
  path.join(
    __dirname,
    "../../Src/Models/User"
  )
);

const StudentProfile = require(
  path.join(
    __dirname,
    "../../Src/Models/StudentProfile"
  )
);

const Project = require(
  path.join(
    __dirname,
    "../../Src/Models/Project"
  )
);

const Experience = require(
  path.join(
    __dirname,
    "../../Src/Models/Experiences"
  )
);

const Education = require(
  path.join(
    __dirname,
    "../../Src/Models/Education"
  )
);

const Skill = require(
  path.join(
    __dirname,
    "../../Src/Models/Skill"
  )
);

const Certificate = require(
  path.join(
    __dirname,
    "../../Src/Models/Certificate"
  )
);

const Resume = require(
  path.join(
    __dirname,
    "../../Src/Models/Resume"
  )
);

const getCandidateContext = async (
  userId
) => {
  const user = await User.findById(userId);

  if (!user || user.role !== "student") {
    throw new Error(
      "Student candidate not found"
    );
  }

  const profile =
    await StudentProfile.findByUserId(
      userId
    );

  if (!profile || !profile.is_public) {
    throw new Error(
      "Public candidate profile not found"
    );
  }

  const [
    projects,
    experiences,
    education,
    skills,
    certificates,
    resumes,
  ] = await Promise.all([
    Project.findAllByUserId(userId),
    Experience.findAllByUserId(userId),
    Education.findAllByUserId(userId),
    Skill.findAllByUserId(userId),
    Certificate.findAllByUserId(userId),
    Resume.findAllByUserId(userId),
  ]);

  const publicProjects =
    projects
      .filter(
        (project) =>
          project.is_public
      )
      .map((project) => ({
        id: project.id,
        title: project.title,
        description:
          project.description,
        tech_stack:
          project.tech_stack,
        link: project.link,
      }));

  const publicExperiences =
    experiences
      .filter(
        (experience) =>
          experience.is_public
      )
      .map((experience) => ({
        company:
          experience.company,
        role: experience.role,
        description:
          experience.description,
        start_date:
          experience.start_date,
        end_date:
          experience.end_date,
        is_current:
          experience.is_current,
      }));

  const publicEducation =
    education
      .filter(
        (item) =>
          item.is_public
      )
      .map((item) => ({
        institution:
          item.institution,
        degree: item.degree,
        field_of_study:
          item.field_of_study,
        start_year:
          item.start_year,
        end_year:
          item.end_year,
        grade: item.grade,
        description:
          item.description,
      }));

  const publicSkills =
    skills
      .filter(
        (skill) =>
          skill.is_public
      )
      .map((skill) => ({
        name: skill.name,
        category:
          skill.category,
        proficiency:
          skill.proficiency,
      }));

  const publicCertificates =
    certificates
      .filter(
        (certificate) =>
          certificate.is_public
      )
      .map((certificate) => ({
        title:
          certificate.title,
        issuer:
          certificate.issuer,
        date:
          certificate.date,
        file_url:
          certificate.file_url,
      }));

  const publicResumes =
    resumes
      .filter(
        (resume) =>
          resume.is_public
      )
      .map((resume) => ({
        id: resume.id,
        title: resume.title,
        template_name:
          resume.template_name,
        resume_data:
          resume.resume_data,
        is_primary:
          resume.is_primary,
        pdf_url:
          resume.pdf_url,
      }));

  return {
    candidate: {
      id: user.id,
      name: user.name,
      public_slug:
        user.public_slug,
    },

    profile: {
      headline:
        profile.headline,
      bio: profile.bio,
      location:
        profile.location,
      website:
        profile.website,
      linkedin:
        profile.linkedin,
      github:
        profile.github,
    },

    projects:
      publicProjects,

    experiences:
      publicExperiences,

    education:
      publicEducation,

    skills:
      publicSkills,

    certificates:
      publicCertificates,

    resumes:
      publicResumes,
  };
};

module.exports = {
  getCandidateContext,
};