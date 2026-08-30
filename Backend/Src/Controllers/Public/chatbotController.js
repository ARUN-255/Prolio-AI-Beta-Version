const {
  buildPublicPortfolio,
} = require("../../Services/publicPortfolioService");

const {
  askPortfolioChatbot,
} = require("../../Services/chatbotService");

const askPublicPortfolioChatbot = async (req, res) => {
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
        message: "Question must be 500 characters or less",
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

    const answer = await askPortfolioChatbot({
      portfolioData: portfolio,
      question: question.trim(),
    });

    return res.status(200).json({
      success: true,
      answer,
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
  message: "Unable to answer the question",
});
  }
};

module.exports = {
  askPublicPortfolioChatbot,
};