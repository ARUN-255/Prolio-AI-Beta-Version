const express = require("express");
const router = express.Router();

const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../Controllers/Student/projectController");
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

module.exports = router;