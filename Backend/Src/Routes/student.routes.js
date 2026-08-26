const express = require("express");
const router = express.Router();

const {
  getMyPortfolio,
} = require("../Controllers/Student/portfolioController");

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

const{
  getExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
} = require("../Controllers/Student/experienceController");

const{
   getEducation,
    createEducation,
    updateEducation,
    deleteEducation,
} = require("../Controllers/Student/educationController");

const{
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

router.get(
  "/portfolio",
  protect,
  authorize("student"),
  getMyPortfolio
);

module.exports = router;