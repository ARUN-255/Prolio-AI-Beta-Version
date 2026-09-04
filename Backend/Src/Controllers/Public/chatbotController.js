const crypto = require("crypto");

const {
  buildPublicPortfolio,
  getPublicPortfolioOwnerId,
} = require("../../Services/publicPortfolioService");

const {
  askPortfolioChatbot,
} = require("../../Services/chatbotService");

const quotaService = require(
  "../../Services/quotaService"
);

const visitorQuotaService = require(
  "../../Services/chatbotVisitorQuotaService"
);

const questionCacheService = require(
  "../../Services/chatbotQuestionCacheService"
);


// ========================================
// CREATE IP FALLBACK ID
// ========================================

const createIpFallbackId = (req) => {
  const forwardedFor =
    req.headers["x-forwarded-for"];

  let ip = "";

  if (
    typeof forwardedFor === "string" &&
    forwardedFor.trim()
  ) {
    ip =
      forwardedFor
        .split(",")[0]
        .trim();
  } else {
    ip =
      req.ip ||
      req.socket?.remoteAddress ||
      "";
  }

  if (!ip) {
    return null;
  }

  /*
   * Never store the raw IP address
   * inside Redis quota keys.
   */

  const hash = crypto
    .createHash("sha256")
    .update(ip)
    .digest("hex");

  return `ip-${hash}`;
};


// ========================================
// GET VISITOR IDENTITY
// ========================================

const getVisitorIdentity = (req) => {
  /*
   * Primary identity:
   * visitor cookie created by the
   * chatbot visitor middleware.
   */

  const cookieVisitorId =
    req.chatbotVisitor?.visitorId;

  if (
    cookieVisitorId &&
    typeof cookieVisitorId === "string"
  ) {
    return cookieVisitorId;
  }

  /*
   * Secondary identity:
   * hashed IP fallback.
   */

  return createIpFallbackId(req);
};


// ========================================
// PUBLIC PORTFOLIO CHATBOT
// ========================================

const askPublicPortfolioChatbot = async (
  req,
  res
) => {
  let ownerId = null;
  let visitorId = null;

  let monthlyReserved = false;
  let visitorReserved = false;

  try {
    const { slug } =
      req.params;

    const { question } =
      req.body;

    // ------------------------------------
    // QUESTION VALIDATION
    // ------------------------------------

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question is required",
      });
    }

    const cleanQuestion =
      question.trim();

    if (
      cleanQuestion.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question must be 500 characters or less",
      });
    }

    // ------------------------------------
    // LOAD PUBLIC PORTFOLIO
    // ------------------------------------

    const portfolio =
      await buildPublicPortfolio(
        slug
      );

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message:
          "Portfolio not found",
      });
    }

    ownerId =
      await getPublicPortfolioOwnerId(
        slug
      );

    if (!ownerId) {
      return res.status(404).json({
        success: false,
        message:
          "Portfolio owner not found",
      });
    }

    // ------------------------------------
    // IDENTIFY VISITOR
    // COOKIE FIRST, IP FALLBACK
    // ------------------------------------

    visitorId =
      getVisitorIdentity(req);

    if (!visitorId) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to identify chatbot visitor",
      });
    }

    // ------------------------------------
    // NORMALIZED QUESTION CACHE
    // ------------------------------------

    const cached =
      await questionCacheService
        .getCachedAnswer(
          ownerId,
          cleanQuestion
        );

    /*
     * Duplicate normalized questions are
     * answered from Redis without another
     * Gemini call.
     *
     * They also do not consume another
     * owner or visitor quota because no
     * new AI generation is performed.
     */

    if (cached) {
      return res.status(200).json({
        success: true,

        answer:
          cached.answer,

        cached: true,

        normalized_question:
          cached.normalized_question,
      });
    }

    // ------------------------------------
    // ATOMICALLY RESERVE OWNER QUOTA
    // ------------------------------------

    const monthlyUsage =
      await quotaService.consumeQuota(
        ownerId,
        "chatbot_questions_per_month"
      );

    if (!monthlyUsage.allowed) {
      return res.status(429).json({
        success: false,

        message:
          "Monthly chatbot question limit reached",

        quota:
          "chatbot_questions_per_month",

        used:
          monthlyUsage.used,

        limit:
          monthlyUsage.limit,

        remaining:
          monthlyUsage.remaining,
      });
    }

    monthlyReserved =
      !monthlyUsage.unlimited;

    // ------------------------------------
    // ATOMICALLY RESERVE VISITOR QUOTA
    // ------------------------------------

    const visitorUsage =
      await visitorQuotaService
        .consumeVisitorQuota(
          ownerId,
          visitorId
        );

    if (!visitorUsage.allowed) {
      /*
       * Owner quota was already reserved,
       * but visitor quota failed.
       *
       * Return the owner reservation.
       */

      if (monthlyReserved) {
        await quotaService.refundQuota(
          ownerId,
          "chatbot_questions_per_month"
        );

        monthlyReserved = false;
      }

      return res.status(429).json({
        success: false,

        message:
          "Visitor chatbot question limit reached",

        quota:
          "chatbot_questions_per_visitor",

        used:
          visitorUsage.used,

        limit:
          visitorUsage.limit,

        remaining:
          visitorUsage.remaining,
      });
    }

    visitorReserved =
      !visitorUsage.unlimited;

    // ------------------------------------
    // ASK AI
    // ------------------------------------

    const answer =
      await askPortfolioChatbot({
        portfolioData:
          portfolio,

        question:
          cleanQuestion,
      });

    // ------------------------------------
    // CACHE SUCCESSFUL ANSWER
    // ------------------------------------

    try {
      await questionCacheService
        .cacheAnswer(
          ownerId,
          cleanQuestion,
          answer
        );
    } catch (cacheError) {
      /*
       * Redis answer-cache failure should
       * not discard a valid AI response.
       */

      console.error(
        "CHATBOT ANSWER CACHE ERROR:",
        cacheError
      );
    }

    // ------------------------------------
    // SUCCESS
    // ------------------------------------

    return res.status(200).json({
      success: true,

      answer,

      cached: false,

      quota: {
        monthly: {
          used:
            monthlyUsage.used,

          limit:
            monthlyUsage.limit,

          remaining:
            monthlyUsage.remaining,

          unlimited:
            monthlyUsage.unlimited,
        },

        visitor: {
          used:
            visitorUsage.used,

          limit:
            visitorUsage.limit,

          remaining:
            visitorUsage.remaining,

          unlimited:
            visitorUsage.unlimited,
        },
      },
    });
  } catch (error) {
    console.error(
      "PUBLIC PORTFOLIO CHATBOT ERROR:",
      error
    );

    // ------------------------------------
    // REFUND VISITOR RESERVATION
    // ------------------------------------

    if (
      visitorReserved &&
      ownerId &&
      visitorId
    ) {
      try {
        await visitorQuotaService
          .refundVisitorQuota(
            ownerId,
            visitorId
          );
      } catch (refundError) {
        console.error(
          "VISITOR CHATBOT QUOTA REFUND ERROR:",
          refundError
        );
      }
    }

    // ------------------------------------
    // REFUND OWNER RESERVATION
    // ------------------------------------

    if (
      monthlyReserved &&
      ownerId
    ) {
      try {
        await quotaService.refundQuota(
          ownerId,
          "chatbot_questions_per_month"
        );
      } catch (refundError) {
        console.error(
          "OWNER CHATBOT QUOTA REFUND ERROR:",
          refundError
        );
      }
    }

    // ------------------------------------
    // AI RATE LIMIT
    // ------------------------------------

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "AI request limit reached. Please try again shortly.",
      });
    }

    // ------------------------------------
    // AI TEMPORARILY UNAVAILABLE
    // ------------------------------------

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message:
          "AI service is temporarily busy. Please try again shortly.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to answer the question",
    });
  }
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
  askPublicPortfolioChatbot,
};