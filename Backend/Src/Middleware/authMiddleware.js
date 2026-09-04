const jwt = require("jsonwebtoken");

const VALID_ROLES = [
  "student",
  "recruiter",
];

const protect = (req, res, next) => {
  try {
    // -------------------------
    // CHECK JWT CONFIGURATION
    // -------------------------

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication configuration error",
      });
    }

    // -------------------------
    // READ AUTHORIZATION HEADER
    // -------------------------

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      typeof authHeader !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    // Require exactly:
    // Bearer <token>

    const parts =
      authHeader.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !==
        "bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const token = parts[1];

    // -------------------------
    // VERIFY TOKEN
    // -------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // -------------------------
    // VALIDATE JWT PAYLOAD
    // -------------------------

    const userId =
      Number(decoded.userId);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }

    if (
      !VALID_ROLES.includes(
        decoded.role
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }

    req.user = {
      id: userId,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};


const authorize = (
  ...allowedRoles
) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access forbidden",
      });
    }

    return next();
  };
};


module.exports = {
  protect,
  authorize,
};