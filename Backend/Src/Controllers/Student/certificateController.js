const Certificate = require("../../Models/Certificate");

const {
  clearPublicPortfolioCacheByUserId,
} = require("../../Services/cacheService");

const quotaService = require(
  "../../Services/quotaService"
);


// GET ALL CERTIFICATES
const getCertificates = async (req, res) => {
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
      message: "Internal server error",
    });
  }
};


// CREATE CERTIFICATE
const createCertificate = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const {
      title,
      issuer,
      date,
      file_url,
      is_public,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message:
          "Certificate title is required",
      });
    }

    // -------------------------
    // CHECK CERTIFICATE LIMIT
    // -------------------------

    const certificateLimit =
      await quotaService.getLimit(
        userId,
        "certificates_max"
      );

    if (certificateLimit === undefined) {
      return res.status(403).json({
        success: false,
        message:
          "Certificates are not available for this plan",
      });
    }

    const existingCertificates =
      await Certificate.findAllByUserId(
        userId
      );

    // null = unlimited
    if (
      certificateLimit !== null &&
      existingCertificates.length >=
        Number(certificateLimit)
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Maximum certificate limit reached",
        quota: "certificates_max",
        used: existingCertificates.length,
        limit: Number(certificateLimit),
        remaining: 0,
      });
    }

    // -------------------------
    // CREATE CERTIFICATE
    // -------------------------

    const certificate =
      await Certificate.create({
        userId,
        title,
        issuer,
        date,
        fileUrl: file_url,
        isPublic: is_public,
      });

    await clearPublicPortfolioCacheByUserId(
      userId
    );

    const used =
      existingCertificates.length + 1;

    return res.status(201).json({
      success: true,
      message:
        "Certificate created successfully",
      certificate,

      quota: {
        used,
        limit:
          certificateLimit === null
            ? null
            : Number(certificateLimit),

        remaining:
          certificateLimit === null
            ? null
            : Math.max(
                Number(certificateLimit) -
                  used,
                0
              ),

        unlimited:
          certificateLimit === null,
      },
    });
  } catch (error) {
    console.error(
      "CREATE CERTIFICATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE CERTIFICATE
const updateCertificate = async (
  req,
  res
) => {
  try {
    const certificateId =
      req.params.id;

    const existingCertificate =
      await Certificate.findByIdAndUserId(
        certificateId,
        req.user.id
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

    if (!title) {
      return res.status(400).json({
        success: false,
        message:
          "Certificate title is required",
      });
    }

    const certificate =
      await Certificate.update({
        id: certificateId,
        userId: req.user.id,
        title,
        issuer,
        date,
        fileUrl: file_url,
        isPublic: is_public,
      });

    await clearPublicPortfolioCacheByUserId(
      req.user.id
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
      message: "Internal server error",
    });
  }
};


// DELETE CERTIFICATE
const deleteCertificate = async (
  req,
  res
) => {
  try {
    const certificate =
      await Certificate.delete(
        req.params.id,
        req.user.id
      );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message:
          "Certificate not found",
      });
    }

    await clearPublicPortfolioCacheByUserId(
      req.user.id
    );

    return res.status(204).send();
  } catch (error) {
    console.error(
      "DELETE CERTIFICATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};