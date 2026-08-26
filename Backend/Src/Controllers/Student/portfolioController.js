const StudentProfile = require("../../Models/StudentProfile");
const Project = require("../../Models/Project");
const Experience = require("../../Models/Experiences");
const Education = require("../../Models/Education");
const Skill = require("../../Models/Skill");
const Certificate = require("../../Models/Certificate");

// GET COMPLETE PORTFOLIO FOR LOGGED-IN STUDENT
const getMyPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

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

    return res.status(200).json({
      success: true,
      portfolio: {
        profile: profile || null,
        projects: projects || [],
        experiences: experiences || [],
        education: education || [],
        skills: skills || [],
        certificates: certificates || [],
      },
    });
  } catch (error) {
    console.error("GET PORTFOLIO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getMyPortfolio,
};