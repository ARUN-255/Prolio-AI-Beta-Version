const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

const {
  redisClient,
} = require("../Config/redis");

const chatbotRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,

  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => {
  if (!redisClient.isReady) {
    throw new Error("Redis client is not ready");
  }

  return redisClient.sendCommand(args);
},
  }),

  message: {
    success: false,
    message:
      "Too many chatbot requests. Please try again in a minute.",
  },
});

module.exports = chatbotRateLimiter;