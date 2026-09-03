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

const askPublicPortfolioChatbot = async (
  req,
  res
) => {
  try {
    const { slug } = req.params;
    const { question } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (question.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message:
          "Question must be 500 characters or less",
      });
    }

    const portfolio =
      await buildPublicPortfolio(slug);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    const ownerId =
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

    const visitorId =
      req.chatbotVisitor?.visitorId;

    if (!visitorId) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to identify chatbot visitor",
      });
    }

    // -------------------------
    // CHECK OWNER MONTHLY QUOTA
    // -------------------------

    const monthlyQuota =
      await quotaService.checkQuota(
        ownerId,
        "chatbot_questions_per_month"
      );

    if (!monthlyQuota.allowed) {
      return res.status(429).json({
        success: false,
        message:
          "Monthly chatbot question limit reached",
        quota:
          "chatbot_questions_per_month",
        used: monthlyQuota.used,
        limit: monthlyQuota.limit,
        remaining:
          monthlyQuota.remaining,
      });
    }

    // -------------------------
    // CHECK VISITOR QUOTA
    // -------------------------

    const visitorQuota =
      await visitorQuotaService.checkVisitorQuota(
        ownerId,
        visitorId
      );

    if (!visitorQuota.allowed) {
      return res.status(429).json({
        success: false,
        message:
          "Visitor chatbot question limit reached",
        quota:
          "chatbot_questions_per_visitor",
        used: visitorQuota.used,
        limit: visitorQuota.limit,
        remaining:
          visitorQuota.remaining,
      });
    }

    // -------------------------
    // ASK AI
    // -------------------------

    const answer =
      await askPortfolioChatbot({
        portfolioData: portfolio,
        question: question.trim(),
      });

    // -------------------------
    // CONSUME BOTH QUOTAS
    // ONLY AFTER AI SUCCESS
    // -------------------------

    const monthlyUsage =
      await quotaService.consumeQuota(
        ownerId,
        "chatbot_questions_per_month"
      );

    const visitorUsage =
      await visitorQuotaService.consumeVisitorQuota(
        ownerId,
        visitorId
      );

    return res.status(200).json({
      success: true,
      answer,

      quota: {
        monthly: {
          used: monthlyUsage.used,
          limit: monthlyUsage.limit,
          remaining:
            monthlyUsage.remaining,
          unlimited:
            monthlyUsage.unlimited,
        },

        visitor: {
          used: visitorUsage.used,
          limit: visitorUsage.limit,
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

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "AI request limit reached. Please try again shortly.",
      });
    }

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

module.exports = {
  askPublicPortfolioChatbot,
};