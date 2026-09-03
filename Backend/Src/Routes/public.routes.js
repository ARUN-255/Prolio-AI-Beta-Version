const express = require("express");

const router = express.Router();

const chatbotRateLimiter =
  require("../Middleware/chatbotRateLimiter");

const chatbotVisitor =
  require("../Middleware/chatbotVisitor");

const {
  getPublicPortfolio,
} = require(
  "../Controllers/Public/publicPortfolioController"
);

const {
  askPublicPortfolioChatbot,
} = require(
  "../Controllers/Public/chatbotController"
);

router.get(
  "/profile/:slug",
  getPublicPortfolio
);

router.post(
  "/profile/:slug/chat",
  chatbotRateLimiter,
  chatbotVisitor,
  askPublicPortfolioChatbot
);

module.exports = router;