const express = require("express");

const router = express.Router();

const {
  protect,
  authorize,
} = require("../Middleware/authMiddleware");

const {
  searchCandidates,
  getCandidateBySlug,
} = require("../Controllers/Recruiter/searchController");

const {
  getPublicResume,
  comparePublicResumes,
  downloadPublicResume,
} = require("../Controllers/Recruiter/comparisonController");

const {
  analyzePublicProject,
} = require("../Controllers/Recruiter/projectAnalyzerController");

router.get(
  "/candidates/search",
  protect,
  authorize("recruiter"),
  searchCandidates
);

router.get(
  "/candidates/:slug",
  protect,
  authorize("recruiter"),
  getCandidateBySlug
);

router.post(
  "/resumes/compare",
  protect,
  authorize("recruiter"),
  comparePublicResumes
);

router.get(
  "/resumes/:id/download",
  protect,
  authorize("recruiter"),
  downloadPublicResume
);

router.get(
  "/resumes/:id",
  protect,
  authorize("recruiter"),
  getPublicResume
);

router.post(
  "/projects/:id/analyze",
  protect,
  authorize("recruiter"),
  analyzePublicProject
);

module.exports = router;