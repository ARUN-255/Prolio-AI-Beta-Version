const Certificate = require("../../Models/Certificate");

const {
  clearPublicPortfolioCacheByUserId,
} = require("../../Services/cacheService");

const quotaService = require(
  "../../Services/quotaService"
);


// ========================================
// GET ALL CERTIFICATES
// ========================================

const getCertificates = async (
  req,
  res
) => {
  try {
    const certificates =
      await Certificate.findAllByUserId(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      certificates,
    });
  } catch (error) {
    console.error(
      "GET CERTIFICATES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};


// ========================================
// CREATE CERTIFICATE
// ========================================

const createCertificate = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    const {
      title,
      issuer,
      date,
      file_url,
      is_public,
    } = req.body;

    // -------------------------
    // VALIDATION
    // -------------------------

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Certificate title is required",
      });
    }

    if (
      is_public !== undefined &&
      typeof is_public !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "is_public must be true or false",
      });
    }

    // -------------------------
    // GET PLAN CERTIFICATE LIMIT
    // -------------------------

    const certificateQuota =
      await quotaService.getLimit(
        userId,
        "certificates_max"
      );

    // -------------------------
    // GET CURRENT COUNT
    // -------------------------

    const existingCertificates =
      await Certificate.findAllByUserId(
        userId
      );

    const currentCount =
      existingCertificates.length;

    // -------------------------
    // ENFORCE MAX LIMIT
    // -------------------------

    if (
      !certificateQuota.unlimited &&
      currentCount >=
        certificateQuota.limit
    ) {
      return res.status(429).json({
        success: false,

        message:
          "Maximum certificate limit reached",

        quota:
          "certificates_max",

        used:
          currentCount,

        limit:
          certificateQuota.limit,

        remaining: 0,

        unlimited: false,
      });
    }

    // -------------------------
    // CREATE CERTIFICATE
    // -------------------------

    const certificate =
      await Certificate.create({
        userId,

        title:
          title.trim(),

        issuer:
          typeof issuer === "string"
            ? issuer.trim()
            : issuer,

        date,

        fileUrl:
          file_url,

        isPublic:
          is_public,
      });

    // -------------------------
    // CLEAR PUBLIC CACHE
    // -------------------------

    await clearPublicPortfolioCacheByUserId(
      userId
    );

    const used =
      currentCount + 1;

    return res.status(201).json({
      success: true,

      message:
        "Certificate created successfully",

      certificate,

      quota: {
        used,

        limit:
          certificateQuota.unlimited
            ? null
            : certificateQuota.limit,

        remaining:
          certificateQuota.unlimited
            ? null
            : Math.max(
                certificateQuota.limit -
                  used,
                0
              ),

        unlimited:
          certificateQuota.unlimited,
      },
    });
  } catch (error) {
    console.error(
      "CREATE CERTIFICATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};


// ========================================
// UPDATE CERTIFICATE
// ========================================

const updateCertificate = async (
  req,
  res
) => {
  try {
    const certificateId =
      req.params.id;

    const userId =
      req.user.id;

    const existingCertificate =
      await Certificate.findByIdAndUserId(
        certificateId,
        userId
      );

    if (!existingCertificate) {
      return res.status(404).json({
        success: false,
        message:
          "Certificate not found",
      });
    }

    const {
      title,
      issuer,
      date,
      file_url,
      is_public,
    } = req.body;

    // -------------------------
    // VALIDATION
    // -------------------------

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Certificate title is required",
      });
    }

    if (
      is_public !== undefined &&
      typeof is_public !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "is_public must be true or false",
      });
    }

    // -------------------------
    // UPDATE CERTIFICATE
    // -------------------------

    const certificate =
      await Certificate.update({
        id:
          certificateId,

        userId,

        title:
          title.trim(),

        issuer:
          typeof issuer === "string"
            ? issuer.trim()
            : issuer,

        date,

        fileUrl:
          file_url,

        isPublic:
          is_public,
      });

    // -------------------------
    // CLEAR PUBLIC CACHE
    // -------------------------

    await clearPublicPortfolioCacheByUserId(
      userId
    );

    return res.status(200).json({
      success: true,

      message:
        "Certificate updated successfully",

      certificate,
    });
  } catch (error) {
    console.error(
      "UPDATE CERTIFICATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};


// ========================================
// DELETE CERTIFICATE
// ========================================

const deleteCertificate = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    const certificate =
      await Certificate.delete(
        req.params.id,
        userId
      );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message:
          "Certificate not found",
      });
    }

    // -------------------------
    // CLEAR PUBLIC CACHE
    // -------------------------

    await clearPublicPortfolioCacheByUserId(
      userId
    );

    /*
     * certificates_max is based on the
     * number of certificates currently
     * stored.
     *
     * Deleting one therefore immediately
     * frees a certificate slot.
     *
     * No Redis quota refund is required.
     */

    return res.status(204).send();
  } catch (error) {
    console.error(
      "DELETE CERTIFICATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};