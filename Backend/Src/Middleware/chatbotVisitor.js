const crypto = require("crypto");

const CHATBOT_VISITOR_COOKIE =
  "prolio_chat_visitor";

const THIRTY_DAYS =
  30 * 24 * 60 * 60 * 1000;

const chatbotVisitor = (
  req,
  res,
  next
) => {
  try {
    let visitorId =
      req.cookies?.[
        CHATBOT_VISITOR_COOKIE
      ];

    // Create stable visitor ID
    // if browser does not already have one
    if (!visitorId) {
      visitorId =
        crypto.randomUUID();

      res.cookie(
        CHATBOT_VISITOR_COOKIE,
        visitorId,
        {
          httpOnly: true,
          sameSite: "lax",
          secure:
            process.env.NODE_ENV ===
            "production",
          maxAge: THIRTY_DAYS,
        }
      );
    }

    // Secondary identifier:
    // hash IP instead of storing raw IP
    const forwardedFor =
      req.headers["x-forwarded-for"];

    const ip =
      typeof forwardedFor === "string"
        ? forwardedFor
            .split(",")[0]
            .trim()
        : req.ip ||
          req.socket?.remoteAddress ||
          "unknown";

    const ipHash = crypto
      .createHash("sha256")
      .update(ip)
      .digest("hex");

    req.chatbotVisitor = {
      visitorId,
      ipHash,
    };

    next();
  } catch (error) {
    console.error(
      "CHATBOT VISITOR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to identify chatbot visitor",
    });
  }
};

module.exports = chatbotVisitor;