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

const {
  extractResumeText,
} = require("../../Services/resumeUploadService");


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

    const quotaUsage = await quotaService.consumeQuota(
      userId,
      "ats_checks_per_month"
    );

    if (!quotaUsage.allowed) {
      return res.status(429).json({
        success: false,
        message: "Monthly ATS check limit reached",
        quota: "ats_checks_per_month",
        used: quotaUsage.used,
        limit: quotaUsage.limit,
        remaining: quotaUsage.remaining,
      });
    }

    quotaReserved = !quotaUsage.unlimited;

    const analysisResult = analyzeResumeAgainstJob(
      resume,
      job_description.trim()
    );

    let aiFeedback = null;

    try {
      aiFeedback = await getAiAtsFeedback({
        resumeData: resume.resume_data || {},
        jobTitle:
          typeof job_title === "string"
            ? job_title.trim()
            : job_title,
        jobDescription: job_description.trim(),
      });
    } catch (aiError) {
      console.error(
        "GEMINI ATS FEEDBACK ERROR:",
        aiError.message
      );
    }

    const analysis = await AtsAnalysis.create({
      userId,
      resumeId: resume_id,
      jobTitle:
        typeof job_title === "string"
          ? job_title.trim()
          : job_title,
      jobDescription: job_description.trim(),
      atsScore: analysisResult.atsScore,
      matchedKeywords: analysisResult.matchedKeywords,
      missingKeywords: analysisResult.missingKeywords,
      matchedSkills: analysisResult.matchedSkills,
      missingSkills: analysisResult.missingSkills,
      strengths: analysisResult.strengths,
      improvements: analysisResult.improvements,
      aiFeedback,
    });

    return res.status(201).json({
      success: true,
      message: "ATS analysis completed successfully",
      analysis,
      quota: {
        used: quotaUsage.used,
        limit: quotaUsage.limit,
        remaining: quotaUsage.remaining,
        unlimited: quotaUsage.unlimited,
      },
    });
  } catch (error) {
    console.error("RUN ATS ANALYSIS ERROR:", error);

    if (quotaReserved) {
      try {
        await quotaService.refundQuota(
          userId,
          "ats_checks_per_month"
        );
      } catch (refundError) {
        console.error("ATS QUOTA REFUND ERROR:", refundError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// RUN ATS ANALYSIS FOR UPLOADED RESUME
// Uploaded files stay in memory and are not
// saved as Prolio resumes or ATS history.
// ========================================

const runUploadedAtsAnalysis = async (req, res) => {
  const userId = req.user.id;
  let quotaReserved = false;

  try {
    const { job_title, job_description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    if (
      !job_description ||
      typeof job_description !== "string" ||
      !job_description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "job_description is required",
      });
    }

    let resumeText;

    try {
      resumeText = await extractResumeText(req.file);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: parseError.message || "Unable to read the uploaded resume",
      });
    }

    const quotaUsage = await quotaService.consumeQuota(
      userId,
      "ats_checks_per_month"
    );

    if (!quotaUsage.allowed) {
      return res.status(429).json({
        success: false,
        message: "Monthly ATS check limit reached",
        quota: "ats_checks_per_month",
        used: quotaUsage.used,
        limit: quotaUsage.limit,
        remaining: quotaUsage.remaining,
      });
    }

    quotaReserved = !quotaUsage.unlimited;

    const uploadedResume = {
      resume_data: {
        raw_text: resumeText,
        source: "uploaded_resume",
        file_name: req.file.originalname,
      },
    };

    const analysisResult = analyzeResumeAgainstJob(
      uploadedResume,
      job_description.trim()
    );

    let aiFeedback = null;

    try {
      aiFeedback = await getAiAtsFeedback({
        resumeData: uploadedResume.resume_data,
        jobTitle:
          typeof job_title === "string"
            ? job_title.trim()
            : job_title,
        jobDescription: job_description.trim(),
      });
    } catch (aiError) {
      console.error(
        "GEMINI UPLOADED ATS FEEDBACK ERROR:",
        aiError.message
      );
    }

    const analysis = {
      id: null,
      source: "upload",
      file_name: req.file.originalname,
      job_title:
        typeof job_title === "string"
          ? job_title.trim()
          : job_title,
      ats_score: analysisResult.atsScore,
      matched_keywords: analysisResult.matchedKeywords,
      missing_keywords: analysisResult.missingKeywords,
      matched_skills: analysisResult.matchedSkills,
      missing_skills: analysisResult.missingSkills,
      strengths: analysisResult.strengths,
      improvements: analysisResult.improvements,
      ai_feedback: aiFeedback,
      created_at: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      message: "Uploaded resume analyzed successfully",
      analysis,
      temporary: true,
      quota: {
        used: quotaUsage.used,
        limit: quotaUsage.limit,
        remaining: quotaUsage.remaining,
        unlimited: quotaUsage.unlimited,
      },
    });
  } catch (error) {
    console.error("RUN UPLOADED ATS ANALYSIS ERROR:", error);

    if (quotaReserved) {
      try {
        await quotaService.refundQuota(
          userId,
          "ats_checks_per_month"
        );
      } catch (refundError) {
        console.error("ATS UPLOAD QUOTA REFUND ERROR:", refundError);
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

const getAtsAnalyses = async (req, res) => {
  try {
    const analyses = await AtsAnalysis.findAllByUserId(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      analyses,
    });
  } catch (error) {
    console.error("GET ATS ANALYSES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// GET ONE ATS ANALYSIS
// ========================================

const getAtsAnalysisById = async (req, res) => {
  try {
    const analysis = await AtsAnalysis.findByIdAndUserId(
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
    console.error("GET ATS ANALYSIS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// DELETE ATS ANALYSIS
// ========================================

const deleteAtsAnalysis = async (req, res) => {
  try {
    const analysis = await AtsAnalysis.deleteByIdAndUserId(
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
    console.error("DELETE ATS ANALYSIS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  runAtsAnalysis,
  runUploadedAtsAnalysis,
  getAtsAnalyses,
  getAtsAnalysisById,
  deleteAtsAnalysis,
};
