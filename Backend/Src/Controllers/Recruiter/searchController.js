const User = require("../../Models/User");
const StudentProfile = require("../../Models/StudentProfile");
const Skill = require("../../Models/Skill");

const {
  buildPublicPortfolio,
} = require("../../Services/publicPortfolioService");


// SEARCH PUBLIC STUDENT CANDIDATES
const searchCandidates = async (req, res) => {
  try {
    const {
      q = "",
      skill = "",
      location = "",
    } = req.query;

    const users = await User.findAllStudents();

    const candidates = [];

    for (const user of users) {
      const profile =
        await StudentProfile.findByUserId(user.id);

      if (!profile || !profile.is_public) {
        continue;
      }

      const skills =
        await Skill.findAllByUserId(user.id);

      const publicSkills = skills
        .filter((item) => item.is_public)
        .map((item) => item.name);

      const searchableText = `
        ${user.name || ""}
        ${profile.headline || ""}
        ${profile.bio || ""}
        ${profile.location || ""}
        ${publicSkills.join(" ")}
      `.toLowerCase();

      if (
        q &&
        !searchableText.includes(q.toLowerCase())
      ) {
        continue;
      }

      if (
        location &&
        !(profile.location || "")
          .toLowerCase()
          .includes(location.toLowerCase())
      ) {
        continue;
      }

      if (
        skill &&
        !publicSkills.some((item) =>
          item
            .toLowerCase()
            .includes(skill.toLowerCase())
        )
      ) {
        continue;
      }

      candidates.push({
        id: user.id,
        name: user.name,
        public_slug: user.public_slug,
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        skills: publicSkills,
      });
    }

    return res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error(
      "RECRUITER SEARCH ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET PUBLIC CANDIDATE PORTFOLIO BY SLUG
const getCandidateBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const portfolio =
      await buildPublicPortfolio(slug);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      candidate: portfolio,
    });
  } catch (error) {
    console.error(
      "GET RECRUITER CANDIDATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  searchCandidates,
  getCandidateBySlug,
};