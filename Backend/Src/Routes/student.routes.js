const express = require("express");
const router = express.Router();

const {
  protect,
  authorize,
} = require("../Middleware/authMiddleware");

const {
  getProfile,
  createProfile,
  updateProfile,
} = require("../Controllers/Student/studentProfileController");

// Student portfolio routes
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

module.exports = router;