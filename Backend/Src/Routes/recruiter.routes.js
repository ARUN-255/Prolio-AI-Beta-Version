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
} = require("../Controllers/Recruiter/comparisonController");

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
  "/resumes/:id",
  protect,
  authorize("recruiter"),
  getPublicResume
);

module.exports = router;