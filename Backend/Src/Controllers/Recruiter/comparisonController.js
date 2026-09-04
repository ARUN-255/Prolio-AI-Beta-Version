const Resume = require("../../Models/Resume");

const {
  compareResumes,
} = require("../../Services/comparisonService");

const {
  analyzeResumeComparisonWithAI,
} = require("../../Services/geminiComparisonService");

const {
  getResumePdfSignedUrl,
} = require("../../Services/s3Service");

const quotaService = require(
  "../../Services/quotaService"
);


// ========================================
// GET PUBLIC RESUME FOR RECRUITER
// ========================================

const getPublicResume = async (
  req,
  res
) => {
  try {
    const resumeId =
      req.params.id;

    const resume =
      await Resume.findPublicById(
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
      message:
        "Internal server error",
    });
  }
};


// ========================================
// COMPARE TWO PUBLIC RESUMES
// ========================================

const comparePublicResumes = async (
  req,
  res
) => {
  const recruiterId =
    req.user.id;

  let quotaName = null;
  let quotaReserved = false;

  try {
    const {
      resume_a_id,
      resume_b_id,
      required_skills = [],
      job_title = "",
      job_description = "",
    } = req.body;

    // -------------------------
    // VALIDATION
    // -------------------------

    if (
      !resume_a_id ||
      !resume_b_id
    ) {
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

    if (
      !Array.isArray(required_skills)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "required_skills must be an array",
      });
    }

    // -------------------------
    // DETERMINE RECRUITER QUOTA
    // -------------------------

    try {
      await quotaService.getLimit(
        recruiterId,
        "comparisons_per_day"
      );

      quotaName =
        "comparisons_per_day";
    } catch (dailyError) {
      try {
        await quotaService.getLimit(
          recruiterId,
          "comparisons_per_month"
        );

        quotaName =
          "comparisons_per_month";
      } catch (monthlyError) {
        return res.status(403).json({
          success: false,
          message:
            "Resume comparison is not available for this plan",
        });
      }
    }

    // -------------------------
    // FIND PUBLIC RESUMES FIRST
    // -------------------------

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

    // -------------------------
    // ATOMICALLY RESERVE QUOTA
    // -------------------------

    const quotaUsage =
      await quotaService.consumeQuota(
        recruiterId,
        quotaName
      );

    if (!quotaUsage.allowed) {
      return res.status(429).json({
        success: false,
        message:
          "Resume comparison limit reached",
        quota:
          quotaName,
        used:
          quotaUsage.used,
        limit:
          quotaUsage.limit,
        remaining:
          quotaUsage.remaining,
      });
    }

    quotaReserved =
      !quotaUsage.unlimited;

    // -------------------------
    // DETERMINISTIC COMPARISON
    // -------------------------

    const comparison =
      compareResumes({
        resumeA,
        resumeB,
        requiredSkills:
          required_skills,
      });

    // -------------------------
    // AI COMPARISON
    // -------------------------

    let aiComparison = null;
    let aiAvailable = true;

    try {
      aiComparison =
        await analyzeResumeComparisonWithAI(
          {
            resumeA,
            resumeB,
            comparison,

            requiredSkills:
              required_skills,

            jobTitle:
              job_title,

            jobDescription:
              job_description,
          }
        );
    } catch (aiError) {
      /*
       * AI failure does not fail the
       * comparison because the
       * deterministic result is valid.
       */

      aiAvailable = false;

      console.error(
        "AI RESUME COMPARISON ERROR:",
        aiError.message
      );
    }

    // -------------------------
    // SUCCESS
    // -------------------------

    return res.status(200).json({
      success: true,

      comparison,

      ai_available:
        aiAvailable,

      ai_comparison:
        aiComparison,

      quota: {
        name:
          quotaName,

        used:
          quotaUsage.used,

        limit:
          quotaUsage.limit,

        remaining:
          quotaUsage.remaining,

        unlimited:
          quotaUsage.unlimited,
      },
    });
  } catch (error) {
    console.error(
      "COMPARE RESUMES ERROR:",
      error
    );

    // -------------------------
    // REFUND RESERVED QUOTA
    // -------------------------

    if (
      quotaReserved &&
      quotaName
    ) {
      try {
        await quotaService.refundQuota(
          recruiterId,
          quotaName
        );
      } catch (refundError) {
        console.error(
          "COMPARISON QUOTA REFUND ERROR:",
          refundError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};


// ========================================
// GET PUBLIC RESUME PDF FOR RECRUITER
// ========================================

const downloadPublicResume = async (
  req,
  res
) => {
  const recruiterId =
    req.user.id;

  let quotaReserved = false;

  try {
    const resumeId =
      req.params.id;

    // -------------------------
    // FIND PUBLIC RESUME FIRST
    // -------------------------

    const resume =
      await Resume.findPublicById(
        resumeId
      );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "Public resume not found",
      });
    }

    if (!resume.pdf_url) {
      return res.status(404).json({
        success: false,
        message:
          "PDF has not been generated for this resume",
      });
    }

    // -------------------------
    // ATOMICALLY RESERVE QUOTA
    // -------------------------

    const quotaUsage =
      await quotaService.consumeQuota(
        recruiterId,
        "resume_downloads_per_month"
      );

    if (!quotaUsage.allowed) {
      return res.status(429).json({
        success: false,
        message:
          "Monthly resume download limit reached",

        quota:
          "resume_downloads_per_month",

        used:
          quotaUsage.used,

        limit:
          quotaUsage.limit,

        remaining:
          quotaUsage.remaining,
      });
    }

    quotaReserved =
      !quotaUsage.unlimited;

    // -------------------------
    // GENERATE PRIVATE S3
    // PRESIGNED DOWNLOAD URL
    // -------------------------

    const signedUrl =
      await getResumePdfSignedUrl(
        resume.pdf_url
      );

    // -------------------------
    // SUCCESS
    // -------------------------

    return res.status(200).json({
      success: true,

      message:
        "Secure resume download ready",

      download: {
        resume_id:
          resume.id,

        title:
          resume.title,

        pdf_url:
          signedUrl,

        expires_in:
          300,
      },

      quota: {
        used:
          quotaUsage.used,

        limit:
          quotaUsage.limit,

        remaining:
          quotaUsage.remaining,

        unlimited:
          quotaUsage.unlimited,
      },
    });
  } catch (error) {
    console.error(
      "DOWNLOAD PUBLIC RESUME ERROR:",
      error
    );

    // -------------------------
    // REFUND DOWNLOAD QUOTA
    // IF SIGNED URL GENERATION
    // OR ANOTHER OPERATION FAILED
    // -------------------------

    if (quotaReserved) {
      try {
        await quotaService.refundQuota(
          recruiterId,
          "resume_downloads_per_month"
        );
      } catch (refundError) {
        console.error(
          "DOWNLOAD QUOTA REFUND ERROR:",
          refundError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
  getPublicResume,
  comparePublicResumes,
  downloadPublicResume,
};