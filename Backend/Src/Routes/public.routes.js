const express = require("express");

const router = express.Router();

const chatbotRateLimiter = require("../Middleware/chatbotRateLimiter");

const {
  getPublicPortfolio,
} = require("../Controllers/Public/publicPortfolioController");

const {
  askPublicPortfolioChatbot,
} = require("../Controllers/Public/chatbotController");

router.get(
  "/profile/:slug",
  getPublicPortfolio
);

router.post(
  "/profile/:slug/chat",
   chatbotRateLimiter,
  askPublicPortfolioChatbot
);

module.exports = router;