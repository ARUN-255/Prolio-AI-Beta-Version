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


// ========================================
// RUN ATS ANALYSIS
// ========================================

const runAtsAnalysis = async (req, res) => {
  const userId = req.user.id;

  let quotaReserved = false;

  try {
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
      typeof job_description !== "string" ||
      !job_description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "job_description is required",
      });
    }

    // -------------------------
    // GET RESUME FIRST
    // -------------------------
    // We verify ownership before reserving
    // quota so an invalid resume ID does
    // not consume one ATS check.
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
    // ATOMICALLY RESERVE ATS QUOTA
    // -------------------------

    const quotaUsage =
      await quotaService.consumeQuota(
        userId,
        "ats_checks_per_month"
      );

    if (!quotaUsage.allowed) {
      return res.status(429).json({
        success: false,
        message:
          "Monthly ATS check limit reached",
        quota: "ats_checks_per_month",
        used: quotaUsage.used,
        limit: quotaUsage.limit,
        remaining:
          quotaUsage.remaining,
      });
    }

    quotaReserved =
      !quotaUsage.unlimited;

    // -------------------------
    // DETERMINISTIC ATS
    // -------------------------

    const analysisResult =
      analyzeResumeAgainstJob(
        resume,
        job_description.trim()
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
          jobTitle:
            typeof job_title === "string"
              ? job_title.trim()
              : job_title,
          jobDescription:
            job_description.trim(),
        });
    } catch (aiError) {
      console.error(
        "GEMINI ATS FEEDBACK ERROR:",
        aiError.message
      );

      /*
       * AI failure does NOT fail the
       * complete ATS request.
       *
       * Deterministic ATS still works,
       * so we continue and save the result.
       */
    }

    // -------------------------
    // SAVE ANALYSIS
    // -------------------------

    const analysis =
      await AtsAnalysis.create({
        userId,
        resumeId: resume_id,

        jobTitle:
          typeof job_title === "string"
            ? job_title.trim()
            : job_title,

        jobDescription:
          job_description.trim(),

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
    // SUCCESS
    // -------------------------

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

    // -------------------------
    // REFUND RESERVED QUOTA
    // IF ATS PROCESS FAILED
    // -------------------------

    if (quotaReserved) {
      try {
        await quotaService.refundQuota(
          userId,
          "ats_checks_per_month"
        );
      } catch (refundError) {
        console.error(
          "ATS QUOTA REFUND ERROR:",
          refundError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// GET ALL ATS ANALYSES
// ========================================

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


// ========================================
// GET ONE ATS ANALYSIS
// ========================================

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


// ========================================
// DELETE ATS ANALYSIS
// ========================================

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


// ========================================
// EXPORTS
// ========================================

module.exports = {
  runAtsAnalysis,
  getAtsAnalyses,
  getAtsAnalysisById,
  deleteAtsAnalysis,
};