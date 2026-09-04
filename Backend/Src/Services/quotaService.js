const { redisClient } = require("../Config/redis");
const subscriptionService = require("./subscriptionService");

// ========================================
// QUOTA TTL SETTINGS
// ========================================

const MONTHLY_TTL_SECONDS = 60 * 60 * 24 * 32;
const DAILY_TTL_SECONDS = 60 * 60 * 24 * 2;


// ========================================
// GET ACTIVE SUBSCRIPTION
// ========================================

const getActiveSubscription = async (userId) => {
  const subscription =
    await subscriptionService.getUserSubscription(userId);

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.status !== "active") {
    throw new Error("Subscription is not active");
  }

  return subscription;
};


// ========================================
// GET LIMIT FOR A QUOTA
// ========================================

const getLimit = async (userId, quotaName) => {
  const subscription =
    await getActiveSubscription(userId);

  const limits = subscription.limits || {};

  if (!Object.prototype.hasOwnProperty.call(limits, quotaName)) {
    throw new Error(
      `Quota "${quotaName}" is not configured for ${subscription.plan_name}`
    );
  }

  const limit = limits[quotaName];

  // null = unlimited
  if (limit === null) {
    return {
      limit: null,
      unlimited: true,
      subscription,
    };
  }

  const numericLimit = Number(limit);

  if (
    !Number.isFinite(numericLimit) ||
    numericLimit < 0
  ) {
    throw new Error(
      `Invalid quota configuration for "${quotaName}"`
    );
  }

  return {
    limit: numericLimit,
    unlimited: false,
    subscription,
  };
};


// ========================================
// BUILD QUOTA PERIOD
// ========================================

const getQuotaPeriod = (
  quotaName,
  subscription = null
) => {
  const now = new Date();

  // Daily quotas
  if (quotaName.endsWith("_per_day")) {
    const year = now.getUTCFullYear();
    const month = String(
      now.getUTCMonth() + 1
    ).padStart(2, "0");
    const day = String(
      now.getUTCDate()
    ).padStart(2, "0");

    return {
      period: `${year}-${month}-${day}`,
      ttl: DAILY_TTL_SECONDS,
    };
  }

  /*
   * Paid plans:
   * Tie monthly quota usage to the actual
   * subscription billing period.
   *
   * Example:
   * 2026-09-04 -> 2026-10-04
   */
  if (
    subscription &&
    subscription.current_period_start &&
    subscription.current_period_end
  ) {
    const start = new Date(
      subscription.current_period_start
    );

    const end = new Date(
      subscription.current_period_end
    );

    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime())
    ) {
      const period = `${start.toISOString()}_${end.toISOString()}`;

      const remainingSeconds = Math.max(
        1,
        Math.ceil(
          (end.getTime() - now.getTime()) / 1000
        )
      );

      return {
        period,
        ttl: remainingSeconds,
      };
    }
  }

  /*
   * Free plans do not have a paid billing
   * period, so use calendar month.
   */
  const year = now.getUTCFullYear();
  const month = String(
    now.getUTCMonth() + 1
  ).padStart(2, "0");

  return {
    period: `${year}-${month}`,
    ttl: MONTHLY_TTL_SECONDS,
  };
};


// ========================================
// BUILD REDIS KEY
// ========================================

const buildQuotaKey = (
  userId,
  quotaName,
  subscription = null
) => {
  const { period, ttl } =
    getQuotaPeriod(
      quotaName,
      subscription
    );

  return {
    key: `quota:${userId}:${quotaName}:${period}`,
    ttl,
  };
};


// ========================================
// GET CURRENT USAGE
// ========================================

const getUsage = async (
  userId,
  quotaName
) => {
  const quota =
    await getLimit(userId, quotaName);

  if (quota.unlimited) {
    return {
      quotaName,
      used: 0,
      limit: null,
      remaining: null,
      unlimited: true,
    };
  }

  const { key } = buildQuotaKey(
    userId,
    quotaName,
    quota.subscription
  );

  const value =
    await redisClient.get(key);

  const used = value
    ? Number(value)
    : 0;

  const remaining = Math.max(
    quota.limit - used,
    0
  );

  return {
    quotaName,
    used,
    limit: quota.limit,
    remaining,
    unlimited: false,
  };
};


// ========================================
// CHECK QUOTA
// ========================================

const checkQuota = async (
  userId,
  quotaName,
  amount = 1
) => {
  const numericAmount = Number(amount);

  if (
    !Number.isInteger(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Quota amount must be a positive integer"
    );
  }

  const quota =
    await getLimit(userId, quotaName);

  if (quota.unlimited) {
    return {
      allowed: true,
      quotaName,
      used: 0,
      limit: null,
      remaining: null,
      unlimited: true,
    };
  }

  const { key } = buildQuotaKey(
    userId,
    quotaName,
    quota.subscription
  );

  const value =
    await redisClient.get(key);

  const used = value
    ? Number(value)
    : 0;

  const allowed =
    used + numericAmount <= quota.limit;

  return {
    allowed,
    quotaName,
    used,
    limit: quota.limit,
    remaining: Math.max(
      quota.limit - used,
      0
    ),
    unlimited: false,
  };
};


// ========================================
// ATOMIC QUOTA CONSUMPTION
// ========================================

const ATOMIC_CONSUME_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
local amount = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])

if current + amount > limit then
    return {-1, current}
end

local newValue = redis.call("INCRBY", KEYS[1], amount)

if newValue == amount then
    redis.call("EXPIRE", KEYS[1], ttl)
end

return {1, newValue}
`;


// ========================================
// CONSUME QUOTA
// ========================================

const consumeQuota = async (
  userId,
  quotaName,
  amount = 1
) => {
  const numericAmount = Number(amount);

  if (
    !Number.isInteger(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Quota amount must be a positive integer"
    );
  }

  const quota =
    await getLimit(userId, quotaName);

  if (quota.unlimited) {
    return {
      allowed: true,
      quotaName,
      used: 0,
      limit: null,
      remaining: null,
      unlimited: true,
    };
  }

  const { key, ttl } = buildQuotaKey(
    userId,
    quotaName,
    quota.subscription
  );

  const result = await redisClient.eval(
    ATOMIC_CONSUME_SCRIPT,
    {
      keys: [key],
      arguments: [
        String(numericAmount),
        String(quota.limit),
        String(ttl),
      ],
    }
  );

  const allowed =
    Number(result[0]) === 1;

  const used =
    Number(result[1]);

  if (!allowed) {
    return {
      allowed: false,
      quotaName,
      used,
      limit: quota.limit,
      remaining: Math.max(
        quota.limit - used,
        0
      ),
      unlimited: false,
    };
  }

  return {
    allowed: true,
    quotaName,
    used,
    limit: quota.limit,
    remaining: Math.max(
      quota.limit - used,
      0
    ),
    unlimited: false,
  };
};


// ========================================
// REFUND QUOTA
// ========================================

const REFUND_QUOTA_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
local amount = tonumber(ARGV[1])

if current <= 0 then
    return 0
end

local newValue = current - amount

if newValue <= 0 then
    redis.call("DEL", KEYS[1])
    return 0
end

redis.call("SET", KEYS[1], newValue, "KEEPTTL")

return newValue
`;

const refundQuota = async (
  userId,
  quotaName,
  amount = 1
) => {
  const numericAmount = Number(amount);

  if (
    !Number.isInteger(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Quota amount must be a positive integer"
    );
  }

  const quota =
    await getLimit(userId, quotaName);

  if (quota.unlimited) {
    return {
      quotaName,
      used: 0,
      limit: null,
      remaining: null,
      unlimited: true,
    };
  }

  const { key } = buildQuotaKey(
    userId,
    quotaName,
    quota.subscription
  );

  const used =
    await redisClient.eval(
      REFUND_QUOTA_SCRIPT,
      {
        keys: [key],
        arguments: [
          String(numericAmount),
        ],
      }
    );

  const numericUsed =
    Number(used);

  return {
    quotaName,
    used: numericUsed,
    limit: quota.limit,
    remaining: Math.max(
      quota.limit - numericUsed,
      0
    ),
    unlimited: false,
  };
};


// ========================================
// RESET QUOTA
// ========================================

const resetQuota = async (
  userId,
  quotaName
) => {
  const quota =
    await getLimit(userId, quotaName);

  if (quota.unlimited) {
    return {
      reset: true,
      quotaName,
    };
  }

  const { key } = buildQuotaKey(
    userId,
    quotaName,
    quota.subscription
  );

  await redisClient.del(key);

  return {
    reset: true,
    quotaName,
  };
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
  getActiveSubscription,
  getLimit,
  getUsage,
  checkQuota,
  consumeQuota,
  refundQuota,
  resetQuota,
};