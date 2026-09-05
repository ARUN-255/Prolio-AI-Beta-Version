const StudentProfile = require("../../Models/StudentProfile");
const Project = require("../../Models/Project");
const Experience = require("../../Models/Experiences");
const Education = require("../../Models/Education");
const Skill = require("../../Models/Skill");
const Certificate = require("../../Models/Certificate");
const User = require("../../Models/User");
const subscriptionService = require("../../Services/subscriptionService");

const buildDefaultSlug = (name, userId) => {
  const base = String(name || "student")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "student";

  return `${base}-${userId}`;
};

// GET COMPLETE PORTFOLIO FOR LOGGED-IN STUDENT
const getMyPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.public_slug) {
      user = await User.updatePublicSlug(
        userId,
        buildDefaultSlug(user.name, userId)
      );
    }

    let subscription = await subscriptionService.getUserSubscription(userId);

    if (!subscription) {
      await subscriptionService.createFreeSubscription(user);
      subscription = await subscriptionService.getUserSubscription(userId);
    }

    const limits = subscription?.limits || {};

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
        user: {
          id: user.id,
          name: user.name,
          public_slug: user.public_slug,
        },
        plan: {
          name: subscription?.plan_name || "Student Free",
          portfolio_watermark: limits.portfolio_watermark !== false,
          custom_link: limits.custom_link === true,
          custom_domain: limits.custom_domain === true,
        },
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
