const Resume = require("../../Models/Resume");
const AtsAnalysis = require("../../Models/AtsAnalysis");

const {
  getAiAtsFeedback,
} = require("../../Services/geminiAtsService");

const {
  analyzeResumeAgainstJob,
} = require("../../Services/atsService");

const quotaService = require(
  "../../Services/quotaService"
);


// RUN ATS ANALYSIS
const runAtsAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      resume_id,
      job_title,
      job_description,
    } = req.body;

    // -------------------------
    // VALIDATION
    // -------------------------

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

    // -------------------------
    // CHECK ATS QUOTA
    // -------------------------

    const quota =
      await quotaService.checkQuota(
        userId,
        "ats_checks_per_month"
      );

    if (!quota.allowed) {
      return res.status(429).json({
        success: false,
        message:
          "Monthly ATS check limit reached",
        quota: "ats_checks_per_month",
        used: quota.used,
        limit: quota.limit,
        remaining: quota.remaining,
      });
    }

    // -------------------------
    // GET RESUME
    // -------------------------

    const resume =
      await Resume.findByIdAndUserId(
        resume_id,
        userId
      );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // -------------------------
    // DETERMINISTIC ATS
    // -------------------------

    const analysisResult =
      analyzeResumeAgainstJob(
        resume,
        job_description
      );

    // -------------------------
    // GEMINI ATS FEEDBACK
    // -------------------------

    let aiFeedback = null;

    try {
      aiFeedback =
        await getAiAtsFeedback({
          resumeData:
            resume.resume_data || {},
          jobTitle: job_title,
          jobDescription:
            job_description,
        });
    } catch (aiError) {
      console.error(
        "GEMINI ATS FEEDBACK ERROR:",
        aiError.message
      );
    }

    // -------------------------
    // SAVE ANALYSIS
    // -------------------------

    const analysis =
      await AtsAnalysis.create({
        userId,
        resumeId: resume_id,
        jobTitle: job_title,
        jobDescription:
          job_description,

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

    // -------------------------
    // CONSUME QUOTA
    // Only after analysis succeeds
    // -------------------------

    const quotaUsage =
      await quotaService.consumeQuota(
        userId,
        "ats_checks_per_month"
      );

    return res.status(201).json({
      success: true,
      message:
        "ATS analysis completed successfully",
      analysis,

      quota: {
        used: quotaUsage.used,
        limit: quotaUsage.limit,
        remaining:
          quotaUsage.remaining,
        unlimited:
          quotaUsage.unlimited,
      },
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
const getAtsAnalyses = async (
  req,
  res
) => {
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
        message:
          "ATS analysis not found",
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
        message:
          "ATS analysis not found",
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