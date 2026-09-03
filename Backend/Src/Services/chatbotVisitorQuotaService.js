const {
  redisClient,
} = require("../Config/redis");

const Subscription =
  require("../Models/Subscription");

const getVisitorLimit = async (
  ownerId
) => {
  const subscription =
    await Subscription.findByUserId(
      ownerId
    );

  if (!subscription) {
    throw new Error(
      "Subscription not found"
    );
  }

  if (
    subscription.status !==
    "active"
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

  return limit;
};

const getVisitorQuotaKey = (
  ownerId,
  visitorId
) => {
  return `chatbot-visitor:${ownerId}:${visitorId}`;
};

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

  const numericLimit =
    Number(limit);

  const used =
    await getVisitorUsage(
      ownerId,
      visitorId
    );

  return {
    allowed:
      used < numericLimit,
    unlimited: false,
    used,
    limit: numericLimit,
    remaining: Math.max(
      numericLimit - used,
      0
    ),
  };
};

const consumeVisitorQuota = async (
  ownerId,
  visitorId
) => {
  const quota =
    await checkVisitorQuota(
      ownerId,
      visitorId
    );

  if (quota.unlimited) {
    return quota;
  }

  if (!quota.allowed) {
    return quota;
  }

  const key =
    getVisitorQuotaKey(
      ownerId,
      visitorId
    );

  const used =
    await redisClient.incr(key);

  const ttl =
    await redisClient.ttl(key);

  if (ttl === -1) {
    await redisClient.expire(
      key,
      60 * 60 * 24 * 30
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

module.exports = {
  getVisitorLimit,
  getVisitorQuotaKey,
  getVisitorUsage,
  checkVisitorQuota,
  consumeVisitorQuota,
};