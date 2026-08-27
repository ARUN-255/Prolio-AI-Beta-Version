const StudentProfile = require("../Models/StudentProfile");
const Project = require("../Models/Project");
const Experience = require("../Models/Experiences");
const Education = require("../Models/Education");
const Skill = require("../Models/Skill");
const Certificate = require("../Models/Certificate");

// BUILD RESUME DATA FROM EXISTING PORTFOLIO
const buildResumeDataFromPortfolio = async (userId) => {
  const [
    profile,
    projects,
    experiences,
    education,
    skills,
    certificates,
  ] = await Promise.all([
    StudentProfile.findByUserId(userId),
    Project.findAllByUserId(userId),
    Experience.findAllByUserId(userId),
    Education.findAllByUserId(userId),
    Skill.findAllByUserId(userId),
    Certificate.findAllByUserId(userId),
  ]);

  return {
    personal_info: {
      headline: profile?.headline || "",
      location: profile?.location || "",
      website: profile?.website || "",
      linkedin: profile?.linkedin || "",
      github: profile?.github || "",
    },

    summary: profile?.bio || "",

    education: (education || []).map((item) => ({
      institution: item.institution,
      degree: item.degree,
      field_of_study: item.field_of_study,
      start_year: item.start_year,
      end_year: item.end_year,
      grade: item.grade,
      description: item.description,
    })),

    experience: (experiences || []).map((item) => ({
      company: item.company,
      role: item.role,
      description: item.description,
      start_date: item.start_date,
      end_date: item.end_date,
      is_current: item.is_current,
    })),

    projects: (projects || []).map((item) => ({
      title: item.title,
      description: item.description,
      tech_stack: item.tech_stack,
      link: item.link,
    })),

    skills: (skills || []).map((item) => ({
      name: item.name,
      category: item.category,
      proficiency: item.proficiency,
    })),

    certificates: (certificates || []).map((item) => ({
      title: item.title,
      issuer: item.issuer,
      date: item.date,
      file_url: item.file_url,
    })),

    section_order: [
      "summary",
      "experience",
      "projects",
      "education",
      "skills",
      "certificates",
    ],
  };
};

module.exports = {
  buildResumeDataFromPortfolio,
};