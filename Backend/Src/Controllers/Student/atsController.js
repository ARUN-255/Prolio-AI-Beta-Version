const Resume = require("../../Models/Resume");
const AtsAnalysis = require("../../Models/AtsAnalysis");
const {
  getAiAtsFeedback,
} = require("../../Services/geminiAtsService");

const {
  analyzeResumeAgainstJob,
} = require("../../Services/atsService");


// RUN ATS ANALYSIS
const runAtsAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      resume_id,
      job_title,
      job_description,
    } = req.body;

    if (!resume_id) {
      return res.status(400).json({
        success: false,
        message: "resume_id is required",
      });
    }

    if (
      !job_description ||
      !job_description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "job_description is required",
      });
    }

    const resume = await Resume.findByIdAndUserId(
      resume_id,
      userId
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const analysisResult =
      analyzeResumeAgainstJob(
        resume,
        job_description
      );

      let aiFeedback = null;

    try {
      aiFeedback = await getAiAtsFeedback({
      resumeData: resume.resume_data || {},
      jobTitle: job_title,
      jobDescription: job_description,
    });
    } catch (aiError) {
      console.error(
      "GEMINI ATS FEEDBACK ERROR:",
      aiError.message
      );
    }

    const analysis =
      await AtsAnalysis.create({
        userId,
        resumeId: resume_id,
        jobTitle: job_title,
        jobDescription: job_description,

        atsScore:
          analysisResult.atsScore,

        matchedKeywords:
          analysisResult.matchedKeywords,

        missingKeywords:
          analysisResult.missingKeywords,

        matchedSkills:
          analysisResult.matchedSkills,

        missingSkills:
          analysisResult.missingSkills,

        strengths:
          analysisResult.strengths,

        improvements:
          analysisResult.improvements,

        aiFeedback,
      });

      return res.status(201).json({
        success: true,
        message:
        "ATS analysis completed successfully",
        analysis,
    });
  } catch (error) {
    console.error(
      "RUN ATS ANALYSIS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET ALL ATS ANALYSES
const getAtsAnalyses = async (req, res) => {
  try {
    const analyses =
      await AtsAnalysis.findAllByUserId(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      analyses,
    });
  } catch (error) {
    console.error(
      "GET ATS ANALYSES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET ONE ATS ANALYSIS
const getAtsAnalysisById = async (
  req,
  res
) => {
  try {
    const analysis =
      await AtsAnalysis.findByIdAndUserId(
        req.params.id,
        req.user.id
      );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "ATS analysis not found",
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      "GET ATS ANALYSIS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// DELETE ATS ANALYSIS
const deleteAtsAnalysis = async (
  req,
  res
) => {
  try {
    const analysis =
      await AtsAnalysis.deleteByIdAndUserId(
        req.params.id,
        req.user.id
      );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "ATS analysis not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(
      "DELETE ATS ANALYSIS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  runAtsAnalysis,
  getAtsAnalyses,
  getAtsAnalysisById,
  deleteAtsAnalysis,
};