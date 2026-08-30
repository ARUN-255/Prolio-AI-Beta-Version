const express = require("express");

const router = express.Router();
const {
  runAtsAnalysis,
  getAtsAnalyses,
  getAtsAnalysisById,
  deleteAtsAnalysis,
} = require("../Controllers/Student/atsController");
const {
  getMyPortfolio,
} = require("../Controllers/Student/portfolioController");

const {
  updateSlug,
} = require("../Controllers/Student/slugController");

const {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  importResumeFromPortfolio,
  updateResumeData,
  updateResumeSection,
  deleteResumeSection,
  generateResumePdfFile,
  getResumePdfUrl,
} = require("../Controllers/Student/resumeController");

const {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} = require("../Controllers/Student/certificateController");

const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../Controllers/Student/projectController");

const {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} = require("../Controllers/Student/experienceController");

const {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} = require("../Controllers/Student/educationController");

const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../Controllers/Student/skillController");

const {
  protect,
  authorize,
} = require("../Middleware/authMiddleware");

const {
  getProfile,
  createProfile,
  updateProfile,
} = require("../Controllers/Student/studentProfileController");


// PROFILE ROUTES
router.get(
  "/portfolio",
  protect,
  authorize("student"),
  getProfile
);

router.post(
  "/portfolio",
  protect,
  authorize("student"),
  createProfile
);

router.put(
  "/portfolio",
  protect,
  authorize("student"),
  updateProfile
);


// PROJECT ROUTES
router.get(
  "/portfolio/projects",
  protect,
  authorize("student"),
  getProjects
);

router.post(
  "/portfolio/projects",
  protect,
  authorize("student"),
  createProject
);

router.put(
  "/portfolio/projects/:id",
  protect,
  authorize("student"),
  updateProject
);

router.delete(
  "/portfolio/projects/:id",
  protect,
  authorize("student"),
  deleteProject
);


// EXPERIENCE ROUTES
router.get(
  "/portfolio/experiences",
  protect,
  authorize("student"),
  getExperiences
);

router.post(
  "/portfolio/experiences",
  protect,
  authorize("student"),
  createExperience
);

router.put(
  "/portfolio/experiences/:id",
  protect,
  authorize("student"),
  updateExperience
);

router.delete(
  "/portfolio/experiences/:id",
  protect,
  authorize("student"),
  deleteExperience
);


// EDUCATION ROUTES
router.get(
  "/portfolio/education",
  protect,
  authorize("student"),
  getEducation
);

router.post(
  "/portfolio/education",
  protect,
  authorize("student"),
  createEducation
);

router.put(
  "/portfolio/education/:id",
  protect,
  authorize("student"),
  updateEducation
);

router.delete(
  "/portfolio/education/:id",
  protect,
  authorize("student"),
  deleteEducation
);


// SKILL ROUTES
router.get(
  "/portfolio/skills",
  protect,
  authorize("student"),
  getSkills
);

router.post(
  "/portfolio/skills",
  protect,
  authorize("student"),
  createSkill
);

router.put(
  "/portfolio/skills/:id",
  protect,
  authorize("student"),
  updateSkill
);

router.delete(
  "/portfolio/skills/:id",
  protect,
  authorize("student"),
  deleteSkill
);


// CERTIFICATE ROUTES
router.get(
  "/portfolio/certificates",
  protect,
  authorize("student"),
  getCertificates
);

router.post(
  "/portfolio/certificates",
  protect,
  authorize("student"),
  createCertificate
);

router.put(
  "/portfolio/certificates/:id",
  protect,
  authorize("student"),
  updateCertificate
);

router.delete(
  "/portfolio/certificates/:id",
  protect,
  authorize("student"),
  deleteCertificate
);


// COMPLETE PORTFOLIO
router.get(
  "/portfolio/all",
  protect,
  authorize("student"),
  getMyPortfolio
);


// PORTFOLIO SLUG
router.put(
  "/portfolio/slug",
  protect,
  authorize("student"),
  updateSlug
);


// RESUME ROUTES
router.get(
  "/resumes",
  protect,
  authorize("student"),
  getResumes
);

router.get(
  "/resumes/import/profile",
  protect,
  authorize("student"),
  importResumeFromPortfolio
);

router.get(
  "/resumes/:id",
  protect,
  authorize("student"),
  getResumeById
);

router.post(
  "/resumes",
  protect,
  authorize("student"),
  createResume
);

router.put(
  "/resumes/:id",
  protect,
  authorize("student"),
  updateResume
);

router.delete(
  "/resumes/:id",
  protect,
  authorize("student"),
  deleteResume
);


// RESUME DATA
router.put(
  "/resume/:id/data",
  protect,
  authorize("student"),
  updateResumeData
);


// RESUME SECTION
router.put(
  "/resume/:id/section",
  protect,
  authorize("student"),
  updateResumeSection
);

router.delete(
  "/resume/:id/section/:sectionName",
  protect,
  authorize("student"),
  deleteResumeSection
);


// GENERATE PDF
router.post(
  "/resume/:id/generate-pdf",
  protect,
  authorize("student"),
  generateResumePdfFile
);


// GET SECURE PDF URL
router.get(
  "/resume/:id/pdf-url",
  protect,
  authorize("student"),
  getResumePdfUrl
);

// ATS ROUTES
router.post(
  "/ats/analyze",
  protect,
  authorize("student"),
  runAtsAnalysis
);

router.get(
  "/ats",
  protect,
  authorize("student"),
  getAtsAnalyses
);

router.get(
  "/ats/:id",
  protect,
  authorize("student"),
  getAtsAnalysisById
);

router.delete(
  "/ats/:id",
  protect,
  authorize("student"),
  deleteAtsAnalysis
);

module.exports = router;