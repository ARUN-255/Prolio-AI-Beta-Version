const Experience = require("../../Models/Experiences");

// GET ALL EXPERIENCES
const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.findAllByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      experiences,
    });
  } catch (error) {
    console.error("GET EXPERIENCES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// CREATE EXPERIENCE
const createExperience = async (req, res) => {
  try {
    const {
      company,
      role,
      description,
      start_date,
      end_date,
      is_current,
      is_public,
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: "Company and role are required",
      });
    }

    const experience = await Experience.create({
      userId: req.user.id,
      company,
      role,
      description,
      startDate: start_date,
      endDate: is_current ? null : end_date,
      isCurrent: is_current,
      isPublic: is_public,
    });

    return res.status(201).json({
      success: true,
      message: "Experience created successfully",
      experience,
    });
  } catch (error) {
    console.error("CREATE EXPERIENCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE EXPERIENCE
const updateExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;

    const existingExperience = await Experience.findByIdAndUserId(
      experienceId,
      req.user.id
    );

    if (!existingExperience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    const {
      company,
      role,
      description,
      start_date,
      end_date,
      is_current,
      is_public,
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: "Company and role are required",
      });
    }

    const experience = await Experience.update({
      id: experienceId,
      userId: req.user.id,
      company,
      role,
      description,
      startDate: start_date,
      endDate: is_current ? null : end_date,
      isCurrent: is_current,
      isPublic: is_public,
    });

    return res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      experience,
    });
  } catch (error) {
    console.error("UPDATE EXPERIENCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE EXPERIENCE
const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.delete(
      req.params.id,
      req.user.id
    );

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE EXPERIENCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
};