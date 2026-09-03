const Project = require("../../Models/Project");

const {
  clearPublicPortfolioCacheByUserId,
} = require("../../Services/cacheService");

const quotaService = require(
  "../../Services/quotaService"
);


// GET PROJECTS
const getProjects = async (req, res) => {
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
      message: "Internal server error",
    });
  }
};


// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      description,
      tech_stack,
      link,
      is_public,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message:
          "Project title is required",
      });
    }

    // -------------------------
    // CHECK PROJECT LIMIT
    // -------------------------

    const projectLimit =
      await quotaService.getLimit(
        userId,
        "projects_max"
      );

    if (projectLimit === undefined) {
      return res.status(403).json({
        success: false,
        message:
          "Projects are not available for this plan",
      });
    }

    const existingProjects =
      await Project.findAllByUserId(
        userId
      );

    // null = unlimited
    if (
      projectLimit !== null &&
      existingProjects.length >=
        Number(projectLimit)
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Maximum project limit reached",
        quota: "projects_max",
        used: existingProjects.length,
        limit: Number(projectLimit),
        remaining: 0,
      });
    }

    // -------------------------
    // CREATE PROJECT
    // -------------------------

    const project =
      await Project.create({
        userId,
        title,
        description,
        techStack: tech_stack,
        link,
        isPublic: is_public,
      });

    await clearPublicPortfolioCacheByUserId(
      userId
    );

    const used =
      existingProjects.length + 1;

    return res.status(201).json({
      success: true,
      message:
        "Project created successfully",
      project,

      quota: {
        used,
        limit:
          projectLimit === null
            ? null
            : Number(projectLimit),
        remaining:
          projectLimit === null
            ? null
            : Math.max(
                Number(projectLimit) -
                  used,
                0
              ),
        unlimited:
          projectLimit === null,
      },
    });
  } catch (error) {
    console.error(
      "CREATE PROJECT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE PROJECT
const updateProject = async (
  req,
  res
) => {
  try {
    const projectId =
      req.params.id;

    const existingProject =
      await Project.findByIdAndUserId(
        projectId,
        req.user.id
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

    if (!title) {
      return res.status(400).json({
        success: false,
        message:
          "Project title is required",
      });
    }

    const project =
      await Project.update({
        id: projectId,
        userId: req.user.id,
        title,
        description,
        techStack: tech_stack,
        link,
        isPublic: is_public,
      });

    await clearPublicPortfolioCacheByUserId(
      req.user.id
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
      message: "Internal server error",
    });
  }
};


// DELETE PROJECT
const deleteProject = async (
  req,
  res
) => {
  try {
    const projectId =
      req.params.id;

    const project =
      await Project.delete(
        projectId,
        req.user.id
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found",
      });
    }

    await clearPublicPortfolioCacheByUserId(
      req.user.id
    );

    return res.status(204).send();
  } catch (error) {
    console.error(
      "DELETE PROJECT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};