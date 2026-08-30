const rateLimit = require("express-rate-limit");

const chatbotRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many chatbot requests. Please try again in a minute.",
  },
});

module.exports = chatbotRateLimiter;