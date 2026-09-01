const Project = require("../../Models/Project");

const {
  analyzeProject,
} = require("../../Services/projectAnalyzerService");

const {
  analyzeProjectWithAI,
} = require("../../Services/geminiProjectAnalyzerService");

const analyzePublicProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const {
      required_skills = [],
      job_title = "",
      job_description = "",
    } = req.body;

    const project =
      await Project.findPublicById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Public project not found",
      });
    }

    const analysis = analyzeProject({
      project,
      requiredSkills: required_skills,
    });

    let aiAnalysis = null;
    let aiAvailable = true;

    try {
      aiAnalysis =
        await analyzeProjectWithAI({
          project,
          analysis,
          requiredSkills: required_skills,
          jobTitle: job_title,
          jobDescription: job_description,
        });
    } catch (aiError) {
      aiAvailable = false;

      console.error(
        "AI PROJECT ANALYSIS ERROR:",
        aiError.message
      );
    }

    return res.status(200).json({
      success: true,
      analysis,
      ai_available: aiAvailable,
      ai_analysis: aiAnalysis,
    });
  } catch (error) {
    console.error(
      "PROJECT ANALYZER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  analyzePublicProject,
};