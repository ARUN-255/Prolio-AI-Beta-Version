const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const extractResumeText = async (file) => {
  if (!file?.buffer) {
    throw new Error("Resume file is required");
  }

  let text = "";

  if (file.mimetype === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    text = parsed.text || "";
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    text = parsed.value || "";
  } else {
    throw new Error("Only PDF and DOCX resumes are supported");
  }

  const cleaned = String(text)
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length < 80) {
    throw new Error(
      "We could not extract enough text from this resume. Try a text-based PDF or DOCX file."
    );
  }

  return cleaned;
};

module.exports = {
  extractResumeText,
};
