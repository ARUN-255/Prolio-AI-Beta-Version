const {
  redisClient,
} = require("../Config/redis");

const subscriptionService = require(
  "./subscriptionService"
);


// ========================================
// CONSTANTS
// ========================================

const VISITOR_QUOTA_TTL =
  60 * 60 * 24 * 30;


// ========================================
// GET VISITOR LIMIT
// ========================================

const getVisitorLimit = async (
  ownerId
) => {
  /*
   * Use subscriptionService rather than
   * Subscription.findByUserId directly.
   *
   * This ensures an expired paid plan is
   * processed before its limits are used.
   */

  const subscription =
    await subscriptionService.getUserSubscription(
      ownerId
    );

  if (!subscription) {
    throw new Error(
      "Subscription not found"
    );
  }

  if (
    subscription.status !== "active"
  ) {
    throw new Error(
      "Subscription is not active"
    );
  }

  const limit =
    subscription.limits?.[
      "chatbot_questions_per_visitor"
    ];

  if (limit === undefined) {
    throw new Error(
      "Visitor chatbot quota is not available for this plan"
    );
  }

  if (limit === null) {
    return null;
  }

  const numericLimit =
    Number(limit);

  if (
    !Number.isFinite(numericLimit) ||
    numericLimit < 0
  ) {
    throw new Error(
      "Invalid visitor chatbot quota configuration"
    );
  }

  return numericLimit;
};


// ========================================
// VISITOR QUOTA KEY
// ========================================

const getVisitorQuotaKey = (
  ownerId,
  visitorId
) => {
  if (!ownerId) {
    throw new Error(
      "ownerId is required"
    );
  }

  if (
    !visitorId ||
    typeof visitorId !== "string"
  ) {
    throw new Error(
      "visitorId is required"
    );
  }

  return (
    `chatbot-visitor:${ownerId}:` +
    `${visitorId}`
  );
};


// ========================================
// GET VISITOR USAGE
// ========================================

const getVisitorUsage = async (
  ownerId,
  visitorId
) => {
  const key =
    getVisitorQuotaKey(
      ownerId,
      visitorId
    );

  const value =
    await redisClient.get(key);

  return value
    ? Number(value)
    : 0;
};


// ========================================
// CHECK VISITOR QUOTA
// ========================================

const checkVisitorQuota = async (
  ownerId,
  visitorId
) => {
  const limit =
    await getVisitorLimit(
      ownerId
    );

  if (limit === null) {
    return {
      allowed: true,
      unlimited: true,
      used: 0,
      limit: null,
      remaining: null,
    };
  }

  const used =
    await getVisitorUsage(
      ownerId,
      visitorId
    );

  return {
    allowed:
      used < limit,

    unlimited: false,

    used,

    limit,

    remaining:
      Math.max(
        limit - used,
        0
      ),
  };
};


// ========================================
// ATOMICALLY CONSUME VISITOR QUOTA
// ========================================

const consumeVisitorQuota = async (
  ownerId,
  visitorId
) => {
  const limit =
    await getVisitorLimit(
      ownerId
    );

  if (limit === null) {
    return {
      allowed: true,
      unlimited: true,
      used: 0,
      limit: null,
      remaining: null,
    };
  }

  const key =
    getVisitorQuotaKey(
      ownerId,
      visitorId
    );

  /*
   * Atomically:
   *
   * 1. Read current usage
   * 2. Reject when limit reached
   * 3. Increment usage
   * 4. Add 30-day TTL on first use
   *
   * This prevents simultaneous requests
   * from exceeding the visitor limit.
   */

  const result =
    await redisClient.eval(
      `
      local current =
        tonumber(redis.call(
          "GET",
          KEYS[1]
        ) or "0")

      local limit =
        tonumber(ARGV[1])

      local ttl =
        tonumber(ARGV[2])

      if current >= limit then
        return {
          0,
          current
        }
      end

      local used =
        redis.call(
          "INCR",
          KEYS[1]
        )

      local currentTtl =
        redis.call(
          "TTL",
          KEYS[1]
        )

      if currentTtl == -1 then
        redis.call(
          "EXPIRE",
          KEYS[1],
          ttl
        )
      end

      return {
        1,
        used
      }
      `,
      {
        keys: [key],
        arguments: [
          String(limit),
          String(
            VISITOR_QUOTA_TTL
          ),
        ],
      }
    );

  const allowed =
    Number(result[0]) === 1;

  const used =
    Number(result[1]);

  return {
    allowed,

    unlimited: false,

    used,

    limit,

    remaining:
      Math.max(
        limit - used,
        0
      ),
  };
};


// ========================================
// REFUND VISITOR QUOTA
// ========================================

const refundVisitorQuota = async (
  ownerId,
  visitorId
) => {
  const limit =
    await getVisitorLimit(
      ownerId
    );

  if (limit === null) {
    return {
      refunded: false,
      unlimited: true,
      used: 0,
      limit: null,
      remaining: null,
    };
  }

  const key =
    getVisitorQuotaKey(
      ownerId,
      visitorId
    );

  /*
   * Preserve the existing TTL.
   *
   * If usage becomes zero, remove the key
   * completely.
   */

  const result =
    await redisClient.eval(
      `
      local current =
        tonumber(redis.call(
          "GET",
          KEYS[1]
        ) or "0")

      if current <= 0 then
        return {
          0,
          0
        }
      end

      local ttl =
        redis.call(
          "TTL",
          KEYS[1]
        )

      local updated =
        current - 1

      if updated <= 0 then
        redis.call(
          "DEL",
          KEYS[1]
        )

        return {
          1,
          0
        }
      end

      redis.call(
        "SET",
        KEYS[1],
        updated
      )

      if ttl > 0 then
        redis.call(
          "EXPIRE",
          KEYS[1],
          ttl
        )
      end

      return {
        1,
        updated
      }
      `,
      {
        keys: [key],
        arguments: [],
      }
    );

  const refunded =
    Number(result[0]) === 1;

  const used =
    Number(result[1]);

  return {
    refunded,

    unlimited: false,

    used,

    limit,

    remaining:
      Math.max(
        limit - used,
        0
      ),
  };
};


// ========================================
// RESET VISITOR QUOTA
// ========================================

const resetVisitorQuota = async (
  ownerId,
  visitorId
) => {
  const key =
    getVisitorQuotaKey(
      ownerId,
      visitorId
    );

  await redisClient.del(key);

  return true;
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
  getVisitorLimit,
  getVisitorQuotaKey,
  getVisitorUsage,
  checkVisitorQuota,
  consumeVisitorQuota,
  refundVisitorQuota,
  resetVisitorQuota,
};