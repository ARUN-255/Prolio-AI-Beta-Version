const quotaService = require("../Services/quotaService");

const requireQuota = (quotaName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const quota = await quotaService.checkQuota(
        req.user.id,
        quotaName
      );

      if (!quota.allowed) {
        return res.status(429).json({
          success: false,
          message: "Quota limit reached",
          quota: quotaName,
          used: quota.used,
          limit: quota.limit,
          remaining: quota.remaining,
        });
      }

      req.quota = {
        name: quotaName,
        ...quota,
      };

      next();
    } catch (error) {
      console.error("QUOTA CHECK ERROR:", error);

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to check quota",
      });
    }
  };
};

const consumeQuota = (quotaName, amount = 1) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const result =
        await quotaService.consumeQuota(
          req.user.id,
          quotaName,
          amount
        );

      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          message: "Quota limit reached",
          quota: quotaName,
          used: result.used,
          limit: result.limit,
          remaining: result.remaining,
        });
      }

      req.quota = {
        name: quotaName,
        ...result,
      };

      next();
    } catch (error) {
      console.error(
        "QUOTA CONSUME ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to consume quota",
      });
    }
  };
};

module.exports = {
  requireQuota,
  consumeQuota,
};