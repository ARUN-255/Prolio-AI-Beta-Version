require("dotenv").config();

const {
  buildPublicPortfolio,
} = require("./publicPortfolioService");

const testPublicPortfolio = async () => {
  try {
    const portfolio =
      await buildPublicPortfolio("arun-ravi-25");

    console.log(
      JSON.stringify(portfolio, null, 2)
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "PUBLIC PORTFOLIO SERVICE TEST ERROR:"
    );
    console.error(error);

    process.exit(1);
  }
};

testPublicPortfolio();