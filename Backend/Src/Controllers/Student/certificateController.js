const Certificate = require("../../Models/Certificate");

const {
  clearPublicPortfolioCacheByUserId,
} = require("../../Services/cacheService");

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
const createCertificate = async (req, res) => {
  try {
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
      await Certificate.create({
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

    return res.status(201).json({
      success: true,
      message:
        "Certificate created successfully",
      certificate,
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
const updateCertificate = async (req, res) => {
  try {
    const certificateId = req.params.id;

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
const deleteCertificate = async (req, res) => {
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