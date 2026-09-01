const {
  buildPublicPortfolio,
} = require("../../Services/publicPortfolioService");

// GET PUBLIC PORTFOLIO BY SLUG
const getPublicPortfolio = async (req, res) => {
  try {
    const { slug } = req.params;

    const portfolio =
      await buildPublicPortfolio(slug);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    return res.status(200).json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error(
      "GET PUBLIC PORTFOLIO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getPublicPortfolio,
};