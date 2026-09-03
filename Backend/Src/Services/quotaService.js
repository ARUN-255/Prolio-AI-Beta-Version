const { redisClient } = require("../Config/redis");
const Subscription = require("../Models/Subscription");

/*
 * Returns the user's current active subscription
 * together with the plan limits.
 */
const getActiveSubscription = async (userId) => {
  const subscription =
    await Subscription.findByUserId(userId);

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.status !== "active") {
    throw new Error("Subscription is not active");
  }

  return subscription;
};

/*
 * Get a specific limit from the user's plan.
 *
 * null = unlimited
 * undefined = feature does not exist in the plan
 */
const getLimit = async (userId, quotaName) => {
  const subscription =
    await getActiveSubscription(userId);

  const limits = subscription.limits || {};

  if (
    !Object.prototype.hasOwnProperty.call(
      limits,
      quotaName
    )
  ) {
    return undefined;
  }

  return limits[quotaName];
};

/*
 * Monthly Redis key.
 *
 * Example:
 * quota:7:ats_checks_per_month:2026-09
 */
const getMonthlyQuotaKey = (
  userId,
  quotaName
) => {
  const now = new Date();

  const year = now.getUTCFullYear();

  const month = String(
    now.getUTCMonth() + 1
  ).padStart(2, "0");

  return `quota:${userId}:${quotaName}:${year}-${month}`;
};

/*
 * Daily Redis key.
 *
 * Used for limits such as:
 * comparisons_per_day
 */
const getDailyQuotaKey = (
  userId,
  quotaName
) => {
  const now = new Date();

  const year = now.getUTCFullYear();

  const month = String(
    now.getUTCMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getUTCDate()
  ).padStart(2, "0");

  return `quota:${userId}:${quotaName}:${year}-${month}-${day}`;
};

const getQuotaKey = (
  userId,
  quotaName
) => {
  if (quotaName.endsWith("_per_day")) {
    return getDailyQuotaKey(
      userId,
      quotaName
    );
  }

  return getMonthlyQuotaKey(
    userId,
    quotaName
  );
};

/*
 * Get current usage from Redis.
 */
const getUsage = async (
  userId,
  quotaName
) => {
  const key = getQuotaKey(
    userId,
    quotaName
  );

  const value =
    await redisClient.get(key);

  return value ? Number(value) : 0;
};

/*
 * Check quota without consuming it.
 */
const checkQuota = async (
  userId,
  quotaName
) => {
  const limit = await getLimit(
    userId,
    quotaName
  );

  if (limit === undefined) {
    throw new Error(
      `Quota "${quotaName}" is not available for this plan`
    );
  }

  // null means unlimited
  if (limit === null) {
    return {
      allowed: true,
      unlimited: true,
      used: 0,
      limit: null,
      remaining: null,
    };
  }

  const numericLimit = Number(limit);

  if (
    Number.isNaN(numericLimit) ||
    numericLimit < 0
  ) {
    throw new Error(
      `Invalid quota configuration for "${quotaName}"`
    );
  }

  const used = await getUsage(
    userId,
    quotaName
  );

  const remaining = Math.max(
    numericLimit - used,
    0
  );

  return {
    allowed: used < numericLimit,
    unlimited: false,
    used,
    limit: numericLimit,
    remaining,
  };
};

/*
 * Consume one quota unit.
 *
 * IMPORTANT:
 * Call this only after the protected action
 * succeeds.
 */
const consumeQuota = async (
  userId,
  quotaName,
  amount = 1
) => {
  if (
    !Number.isInteger(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Quota amount must be a positive integer"
    );
  }

  const quota = await checkQuota(
    userId,
    quotaName
  );

  if (quota.unlimited) {
    return quota;
  }

  if (
    quota.used + amount >
    quota.limit
  ) {
    return {
      allowed: false,
      unlimited: false,
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
    };
  }

  const key = getQuotaKey(
    userId,
    quotaName
  );

  const used =
    await redisClient.incrBy(
      key,
      amount
    );

  /*
   * Keep counters temporary.
   *
   * 32 days covers monthly counters.
   * 2 days covers daily counters.
   * The date inside the key ensures a new
   * billing period/day gets a fresh counter.
   */
  const ttlSeconds =
    quotaName.endsWith("_per_day")
      ? 60 * 60 * 24 * 2
      : 60 * 60 * 24 * 32;

  const ttl =
    await redisClient.ttl(key);

  if (ttl === -1) {
    await redisClient.expire(
      key,
      ttlSeconds
    );
  }

  return {
    allowed: true,
    unlimited: false,
    used,
    limit: quota.limit,
    remaining: Math.max(
      quota.limit - used,
      0
    ),
  };
};

/*
 * Reset one quota.
 * Useful for testing/admin operations.
 */
const resetQuota = async (
  userId,
  quotaName
) => {
  const key = getQuotaKey(
    userId,
    quotaName
  );

  await redisClient.del(key);

  return true;
};

module.exports = {
  getActiveSubscription,
  getLimit,
  getQuotaKey,
  getUsage,
  checkQuota,
  consumeQuota,
  resetQuota,
};