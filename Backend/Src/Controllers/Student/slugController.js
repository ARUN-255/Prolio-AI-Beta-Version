const User = require("../../Models/User");

const {
  clearPublicPortfolioCache,
} = require("../../Services/cacheService");

// UPDATE PUBLIC PORTFOLIO SLUG
const updateSlug = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (normalizedSlug.length < 3) {
      return res.status(400).json({
        success: false,
        message:
          "Slug must be at least 3 characters long",
      });
    }

    const currentUser =
      await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldSlug =
      currentUser.public_slug;

    const existingUser =
      await User.findBySlug(
        normalizedSlug
      );

    if (
      existingUser &&
      existingUser.id !== userId
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This portfolio link is already taken",
      });
    }

    const user =
      await User.updatePublicSlug(
        userId,
        normalizedSlug
      );

    // CLEAR OLD SLUG CACHE
    if (oldSlug) {
      await clearPublicPortfolioCache(
        oldSlug
      );
    }

    // CLEAR NEW SLUG CACHE TOO
    await clearPublicPortfolioCache(
      normalizedSlug
    );

    return res.status(200).json({
      success: true,
      message:
        "Portfolio link updated successfully",
      public_slug: user.public_slug,
    });
  } catch (error) {
    console.error(
      "UPDATE PUBLIC SLUG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  updateSlug,
};