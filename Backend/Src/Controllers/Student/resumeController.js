const Resume = require("../../Models/Resume");
const {
  buildResumeDataFromPortfolio,
} = require("../../Services/resumeService");

// GET ALL RESUMES
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAllByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    console.error("GET RESUMES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ONE RESUME
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndUserId(
      req.params.id,
      req.user.id
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("GET RESUME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// CREATE RESUME
const createResume = async (req, res) => {
  try {
    const {
      title,
      template_name,
      resume_data,
      is_primary,
      is_public,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Resume title is required",
      });
    }

    if (is_primary === true) {
      await Resume.clearPrimary(req.user.id);
    }

    const resume = await Resume.create({
      userId: req.user.id,
      title,
      templateName: template_name,
      resumeData: resume_data,
      isPrimary: is_primary,
      isPublic: is_public,
    });

    return res.status(201).json({
      success: true,
      message: "Resume created successfully",
      resume,
    });
  } catch (error) {
    console.error("CREATE RESUME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE RESUME
const updateResume = async (req, res) => {
  try {
    const resumeId = req.params.id;

    const existingResume = await Resume.findByIdAndUserId(
      resumeId,
      req.user.id
    );

    if (!existingResume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const {
      title,
      template_name,
      resume_data,
      is_primary,
      is_public,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Resume title is required",
      });
    }

    if (is_primary === true) {
      await Resume.clearPrimary(
        req.user.id,
        resumeId
      );
    }

    const resume = await Resume.update({
      id: resumeId,
      userId: req.user.id,
      title,
      templateName: template_name,
      resumeData: resume_data,
      isPrimary: is_primary,
      isPublic: is_public,
    });

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      resume,
    });
  } catch (error) {
    console.error("UPDATE RESUME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE RESUME
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.delete(
      req.params.id,
      req.user.id
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE RESUME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// IMPORT / PREVIEW RESUME DATA FROM PORTFOLIO
const importResumeFromPortfolio = async (req, res) => {
  try {
    const resumeData = await buildResumeDataFromPortfolio(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Resume data imported from portfolio successfully",
      resume_data: resumeData,
    });
  } catch (error) {
    console.error("IMPORT RESUME DATA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  importResumeFromPortfolio,
};