const fs = require("fs");

const Resume = require("../../Models/Resume");

const {
  buildResumeDataFromPortfolio,
} = require("../../Services/resumeService");

const {
  generateResumePdf,
} = require("../../Services/resumePdfService");

const {
  uploadResumePdf,
  getResumePdfSignedUrl,
  deleteResumePdf,
} = require("../../Services/s3Service");


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
    const resumeId = req.params.id;
    const userId = req.user.id;

    const existingResume = await Resume.findByIdAndUserId(
      resumeId,
      userId
    );

    if (!existingResume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Delete PDF from S3 if it exists
    if (existingResume.pdf_url) {
      await deleteResumePdf(existingResume.pdf_url);
    }

    // Delete resume from PostgreSQL
    await Resume.delete(
      resumeId,
      userId
    );

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE RESUME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// IMPORT RESUME DATA FROM PORTFOLIO
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


// UPDATE COMPLETE RESUME DATA
const updateResumeData = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const { resume_data } = req.body;

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

    if (resume_data === undefined) {
      return res.status(400).json({
        success: false,
        message: "resume_data is required",
      });
    }

    const resume = await Resume.updateResumeData(
      resumeId,
      req.user.id,
      resume_data
    );

    return res.status(200).json({
      success: true,
      message: "Resume data updated successfully",
      resume,
    });
  } catch (error) {
    console.error("UPDATE RESUME DATA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE ONE RESUME SECTION
const updateResumeSection = async (req, res) => {
  try {
    const resumeId = req.params.id;

    const {
      section_name,
      section_data,
    } = req.body;

    if (!section_name) {
      return res.status(400).json({
        success: false,
        message: "section_name is required",
      });
    }

    if (section_data === undefined) {
      return res.status(400).json({
        success: false,
        message: "section_data is required",
      });
    }

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

    const resume = await Resume.updateSection(
      resumeId,
      req.user.id,
      section_name,
      section_data
    );

    return res.status(200).json({
      success: true,
      message: "Resume section updated successfully",
      resume,
    });
  } catch (error) {
    console.error("UPDATE RESUME SECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// DELETE ONE RESUME SECTION
const deleteResumeSection = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const sectionName = req.params.sectionName;

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

    if (
      !existingResume.resume_data ||
      !Object.prototype.hasOwnProperty.call(
        existingResume.resume_data,
        sectionName
      )
    ) {
      return res.status(404).json({
        success: false,
        message: "Resume section not found",
      });
    }

    const resume = await Resume.deleteSection(
      resumeId,
      req.user.id,
      sectionName
    );

    return res.status(200).json({
      success: true,
      message: "Resume section deleted successfully",
      resume,
    });
  } catch (error) {
    console.error("DELETE RESUME SECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GENERATE RESUME PDF AND UPLOAD TO S3
const generateResumePdfFile = async (req, res) => {
  let generatedPdf;

  try {
    const resumeId = req.params.id;
    const userId = req.user.id;

    const resume = await Resume.findByIdAndUserId(
      resumeId,
      userId
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Generate PDF locally
    generatedPdf = await generateResumePdf(resume);

    // Upload PDF to S3
    const uploadedPdf = await uploadResumePdf(
      generatedPdf.filePath,
      userId,
      resumeId
    );

    // Save S3 key in PostgreSQL
    const updatedResume = await Resume.updatePdfUrl(
      resumeId,
      userId,
      uploadedPdf.key
    );

    // Delete local temporary PDF
    if (
      generatedPdf.filePath &&
      fs.existsSync(generatedPdf.filePath)
    ) {
      fs.unlinkSync(generatedPdf.filePath);
    }

    return res.status(200).json({
      success: true,
      message: "Resume PDF generated and uploaded successfully",
      s3_key: uploadedPdf.key,
      resume: updatedResume,
    });
  } catch (error) {
    console.error("GENERATE RESUME PDF ERROR:", error);

    // Also attempt cleanup if something fails after PDF generation
    if (
      generatedPdf &&
      generatedPdf.filePath &&
      fs.existsSync(generatedPdf.filePath)
    ) {
      try {
        fs.unlinkSync(generatedPdf.filePath);
      } catch (cleanupError) {
        console.error(
          "LOCAL PDF CLEANUP ERROR:",
          cleanupError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET TEMPORARY SECURE PDF URL
const getResumePdfUrl = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user.id;

    const resume = await Resume.findByIdAndUserId(
      resumeId,
      userId
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    if (!resume.pdf_url) {
      return res.status(404).json({
        success: false,
        message: "Resume PDF has not been generated yet",
      });
    }

    const signedUrl = await getResumePdfSignedUrl(
      resume.pdf_url
    );

    return res.status(200).json({
      success: true,
      message: "Secure resume PDF URL generated successfully",
      pdf_url: signedUrl,
      expires_in: 300,
    });
  } catch (error) {
    console.error("GET RESUME PDF URL ERROR:", error);

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
  updateResumeData,
  updateResumeSection,
  deleteResumeSection,
  generateResumePdfFile,
  getResumePdfUrl,
};