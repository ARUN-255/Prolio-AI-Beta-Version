const Skill = require("../../Models/Skill");

// GET ALL SKILLS
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.findAllByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error("GET SKILLS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// CREATE SKILL
const createSkill = async (req, res) => {
  try {
    const {
      name,
      category,
      proficiency,
      is_public,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    const skill = await Skill.create({
      userId: req.user.id,
      name,
      category,
      proficiency,
      isPublic: is_public,
    });

    return res.status(201).json({
      success: true,
      message: "Skill created successfully",
      skill,
    });
  } catch (error) {
    console.error("CREATE SKILL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE SKILL
const updateSkill = async (req, res) => {
  try {
    const skillId = req.params.id;

    const existingSkill = await Skill.findByIdAndUserId(
      skillId,
      req.user.id
    );

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    const {
      name,
      category,
      proficiency,
      is_public,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    const skill = await Skill.update({
      id: skillId,
      userId: req.user.id,
      name,
      category,
      proficiency,
      isPublic: is_public,
    });

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      skill,
    });
  } catch (error) {
    console.error("UPDATE SKILL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE SKILL
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.delete(
      req.params.id,
      req.user.id
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE SKILL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};