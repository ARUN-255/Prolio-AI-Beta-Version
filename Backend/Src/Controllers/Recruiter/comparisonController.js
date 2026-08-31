const Resume = require("../../Models/Resume");
const {
  compareResumes,
} = require("../../Services/comparisonService");
const {
  analyzeResumeComparisonWithAI,
} = require("../../Services/geminiComparisonService");


// GET PUBLIC RESUME FOR RECRUITER
const getPublicResume = async (req, res) => {
  try {
    const resumeId = req.params.id;

    const resume = await Resume.findPublicById(
      resumeId
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "Public resume not found",
      });
    }

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error(
      "GET PUBLIC RESUME ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// COMPARE TWO PUBLIC RESUMES
const comparePublicResumes = async (req, res) => {
  try {
    const {
      resume_a_id,
      resume_b_id,
      required_skills = [],
      job_title = "",
      job_description = "",
    } = req.body;

    if (!resume_a_id || !resume_b_id) {
      return res.status(400).json({
        success: false,
        message:
          "resume_a_id and resume_b_id are required",
      });
    }

    if (
      String(resume_a_id) ===
      String(resume_b_id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select two different resumes",
      });
    }

    const resumeA =
      await Resume.findPublicById(
        resume_a_id
      );

    const resumeB =
      await Resume.findPublicById(
        resume_b_id
      );

    if (!resumeA || !resumeB) {
      return res.status(404).json({
        success: false,
        message:
          "One or both public resumes were not found",
      });
    }

    const comparison = compareResumes({
      resumeA,
      resumeB,
      requiredSkills: required_skills,
    });

    let aiComparison = null;
let aiAvailable = true;

try {
  aiComparison =
    await analyzeResumeComparisonWithAI({
      resumeA,
      resumeB,
      comparison,
      requiredSkills: required_skills,
      jobTitle: job_title,
      jobDescription: job_description,
    });
} catch (aiError) {
  aiAvailable = false;

  console.error(
    "AI RESUME COMPARISON ERROR:",
    aiError.message
  );
}

    return res.status(200).json({
      success: true,
      comparison,
      ai_available: aiAvailable,
      ai_comparison: aiComparison,
    });
  } catch (error) {
    console.error(
      "COMPARE RESUMES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getPublicResume,
  comparePublicResumes,
};