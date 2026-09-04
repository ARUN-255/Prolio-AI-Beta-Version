const Project = require("../../Models/Project");

const {
  clearPublicPortfolioCacheByUserId,
} = require("../../Services/cacheService");

const quotaService = require(
  "../../Services/quotaService"
);


// ========================================
// GET PROJECTS
// ========================================

const getProjects = async (
  req,
  res
) => {
  try {
    const projects =
      await Project.findAllByUserId(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error(
      "GET PROJECTS ERROR:",
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
// CREATE PROJECT
// ========================================

const createProject = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    const {
      title,
      description,
      tech_stack,
      link,
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
          "Project title is required",
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
    // GET PLAN PROJECT LIMIT
    // -------------------------

    const projectQuota =
      await quotaService.getLimit(
        userId,
        "projects_max"
      );

    // -------------------------
    // GET CURRENT PROJECT COUNT
    // -------------------------

    const existingProjects =
      await Project.findAllByUserId(
        userId
      );

    const currentCount =
      existingProjects.length;

    // -------------------------
    // ENFORCE MAX PROJECT LIMIT
    // -------------------------

    if (
      !projectQuota.unlimited &&
      currentCount >=
        projectQuota.limit
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Maximum project limit reached",

        quota:
          "projects_max",

        used:
          currentCount,

        limit:
          projectQuota.limit,

        remaining: 0,

        unlimited: false,
      });
    }

    // -------------------------
    // CREATE PROJECT
    // -------------------------

    const project =
      await Project.create({
        userId,

        title:
          title.trim(),

        description,

        techStack:
          tech_stack,

        link,

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

    // -------------------------
    // SUCCESS RESPONSE
    // -------------------------

    return res.status(201).json({
      success: true,

      message:
        "Project created successfully",

      project,

      quota: {
        used,

        limit:
          projectQuota.unlimited
            ? null
            : projectQuota.limit,

        remaining:
          projectQuota.unlimited
            ? null
            : Math.max(
                projectQuota.limit -
                  used,
                0
              ),

        unlimited:
          projectQuota.unlimited,
      },
    });
  } catch (error) {
    console.error(
      "CREATE PROJECT ERROR:",
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
// UPDATE PROJECT
// ========================================

const updateProject = async (
  req,
  res
) => {
  try {
    const projectId =
      req.params.id;

    const userId =
      req.user.id;

    const existingProject =
      await Project.findByIdAndUserId(
        projectId,
        userId
      );

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found",
      });
    }

    const {
      title,
      description,
      tech_stack,
      link,
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
          "Project title is required",
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
    // UPDATE PROJECT
    // -------------------------

    const project =
      await Project.update({
        id: projectId,
        userId,

        title:
          title.trim(),

        description,

        techStack:
          tech_stack,

        link,

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
        "Project updated successfully",

      project,
    });
  } catch (error) {
    console.error(
      "UPDATE PROJECT ERROR:",
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
// DELETE PROJECT
// ========================================

const deleteProject = async (
  req,
  res
) => {
  try {
    const projectId =
      req.params.id;

    const userId =
      req.user.id;

    const project =
      await Project.delete(
        projectId,
        userId
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found",
      });
    }

    // -------------------------
    // CLEAR PUBLIC CACHE
    // -------------------------

    await clearPublicPortfolioCacheByUserId(
      userId
    );

    /*
     * No Redis quota refund is needed here.
     *
     * projects_max is based on the actual
     * number of projects currently stored.
     *
     * Once this project is deleted,
     * Project.findAllByUserId() will
     * naturally return one fewer project.
     */

    return res.status(204).send();
  } catch (error) {
    console.error(
      "DELETE PROJECT ERROR:",
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
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};