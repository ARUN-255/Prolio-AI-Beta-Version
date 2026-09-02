const {
  redisClient,
} = require("../Config/redis");

const User = require("../Models/User");

// CLEAR CACHE DIRECTLY BY SLUG
const clearPublicPortfolioCache = async (slug) => {
  if (!slug || !redisClient.isReady) {
    return;
  }

  const cacheKey =
    `public-portfolio:${slug}`;

  await redisClient.del(cacheKey);
};

// CLEAR CACHE USING USER ID
const clearPublicPortfolioCacheByUserId = async (
  userId
) => {
  if (!userId || !redisClient.isReady) {
    return;
  }

  const user = await User.findById(userId);

  if (!user || !user.public_slug) {
    return;
  }

  await clearPublicPortfolioCache(
    user.public_slug
  );
};

module.exports = {
  clearPublicPortfolioCache,
  clearPublicPortfolioCacheByUserId,
};