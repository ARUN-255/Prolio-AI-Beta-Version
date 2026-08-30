const User = require("../Models/User");
const StudentProfile = require("../Models/StudentProfile");
const Project = require("../Models/Project");
const Experience = require("../Models/Experiences");
const Education = require("../Models/Education");
const Skill = require("../Models/Skill");
const Certificate = require("../Models/Certificate");

const buildPublicPortfolio = async (slug) => {
  const user = await User.findBySlug(slug);

  if (!user || user.role !== "student") {
    return null;
  }

  const userId = user.id;

  const profile =
    await StudentProfile.findByUserId(userId);

  if (!profile || !profile.is_public) {
    return null;
  }

  const [
    projects,
    experiences,
    education,
    skills,
    certificates,
  ] = await Promise.all([
    Project.findAllByUserId(userId),
    Experience.findAllByUserId(userId),
    Education.findAllByUserId(userId),
    Skill.findAllByUserId(userId),
    Certificate.findAllByUserId(userId),
  ]);

  const publicProjects = projects
    .filter((project) => project.is_public)
    .map((project) => ({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack,
      link: project.link,
    }));

  const publicExperiences = experiences
    .filter((experience) => experience.is_public)
    .map((experience) => ({
      company: experience.company,
      role: experience.role,
      description: experience.description,
      start_date: experience.start_date,
      end_date: experience.end_date,
      is_current: experience.is_current,
    }));

  const publicEducation = education
    .filter((item) => item.is_public)
    .map((item) => ({
      institution: item.institution,
      degree: item.degree,
      field_of_study: item.field_of_study,
      start_year: item.start_year,
      end_year: item.end_year,
      grade: item.grade,
      description: item.description,
    }));

  const publicSkills = skills
    .filter((skill) => skill.is_public)
    .map((skill) => ({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
    }));

  const publicCertificates = certificates
    .filter((certificate) => certificate.is_public)
    .map((certificate) => ({
      title: certificate.title,
      issuer: certificate.issuer,
      date: certificate.date,
      file_url: certificate.file_url,
    }));

  return {
    user: {
      name: user.name,
      public_slug: user.public_slug,
    },

    profile: {
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      linkedin: profile.linkedin,
      github: profile.github,
      education: profile.education,
      skills: profile.skills,
      social_links: profile.social_links,
    },

    projects: publicProjects,
    experiences: publicExperiences,
    education: publicEducation,
    skills: publicSkills,
    certificates: publicCertificates,
  };
};

module.exports = {
  buildPublicPortfolio,
};