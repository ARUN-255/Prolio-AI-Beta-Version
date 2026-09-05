const multer = require("multer");

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Only PDF and DOCX resumes are supported"));
    }

    callback(null, true);
  },
});

const handleResumeUpload = (req, res, next) => {
  uploadResume.single("resume")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Resume file must be 5 MB or smaller",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to upload resume",
    });
  });
};

module.exports = {
  handleResumeUpload,
};
