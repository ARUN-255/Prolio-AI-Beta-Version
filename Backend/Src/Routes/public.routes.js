const express = require("express");
const router = express.Router();

const {
  getPublicPortfolio,
} = require("../Controllers/Public/publicPortfolioController");

router.get(
  "/profile/:slug",
  getPublicPortfolio
);

module.exports = router;