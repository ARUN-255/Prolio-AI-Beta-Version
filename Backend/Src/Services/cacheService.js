const {
  redisClient,
} = require("../Config/redis");

const User = require("../Models/User");

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

  const cacheKey =
    `public-portfolio:${user.public_slug}`;

  await redisClient.del(cacheKey);
};

module.exports = {
  clearPublicPortfolioCacheByUserId,
};