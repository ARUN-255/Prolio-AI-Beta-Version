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

router.get(
  "/profile",
  protect,
  authorize("student"),
  getProfile
);

router.post(
  "/profile",
  protect,
  authorize("student"),
  createProfile
);

router.put(
  "/profile",
  protect,
  authorize("student"),
  updateProfile
);

module.exports = router;