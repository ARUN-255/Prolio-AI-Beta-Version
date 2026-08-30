const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateResumePdf = async (resume) => {
  return new Promise((resolve, reject) => {
    try {
      const outputDir = path.join(__dirname, "../../generated/resumes");

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileName = `resume-${resume.id}-${Date.now()}.pdf`;
      const filePath = path.join(outputDir, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      const data = resume.resume_data || {};

      // PERSONAL INFO
      if (data.personal_info) {
        doc
          .fontSize(22)
          .text(data.personal_info.name || "Resume", {
            align: "center",
          });

        if (data.personal_info.headline) {
          doc
            .fontSize(12)
            .text(data.personal_info.headline, {
              align: "center",
            });
        }

        doc.moveDown();
      }

      // SUMMARY
      if (data.summary) {
        doc.fontSize(16).text("Summary");
        doc.moveDown(0.3);

        doc.fontSize(11).text(data.summary);

        doc.moveDown();
      }

      // SKILLS
      if (Array.isArray(data.skills) && data.skills.length > 0) {
        doc.fontSize(16).text("Skills");
        doc.moveDown(0.3);

        doc.fontSize(11).text(data.skills.join(" • "));

        doc.moveDown();
      }

      // EXPERIENCE
      if (
        Array.isArray(data.experience) &&
        data.experience.length > 0
      ) {
        doc.fontSize(16).text("Experience");
        doc.moveDown(0.3);

        data.experience.forEach((experience) => {
          doc
            .fontSize(12)
            .text(
              experience.role ||
                experience.title ||
                "Experience"
            );

          if (experience.company) {
            doc.fontSize(11).text(experience.company);
          }

          if (experience.description) {
            doc
              .fontSize(10)
              .text(experience.description);
          }

          doc.moveDown(0.7);
        });
      }

      // PROJECTS
      if (
        Array.isArray(data.projects) &&
        data.projects.length > 0
      ) {
        doc.fontSize(16).text("Projects");
        doc.moveDown(0.3);

        data.projects.forEach((project) => {
          doc
            .fontSize(12)
            .text(project.title || project.name || "Project");

          if (project.description) {
            doc
              .fontSize(10)
              .text(project.description);
          }

          doc.moveDown(0.7);
        });
      }

      // EDUCATION
      if (
        Array.isArray(data.education) &&
        data.education.length > 0
      ) {
        doc.fontSize(16).text("Education");
        doc.moveDown(0.3);

        data.education.forEach((education) => {
          doc
            .fontSize(12)
            .text(
              education.degree ||
                education.course ||
                "Education"
            );

          if (education.institution) {
            doc
              .fontSize(11)
              .text(education.institution);
          }

          doc.moveDown(0.7);
        });
      }

      // CERTIFICATES
      if (
        Array.isArray(data.certificates) &&
        data.certificates.length > 0
      ) {
        doc.fontSize(16).text("Certificates");
        doc.moveDown(0.3);

        data.certificates.forEach((certificate) => {
          doc
            .fontSize(11)
            .text(
              certificate.title ||
                certificate.name ||
                "Certificate"
            );

          if (certificate.issuer) {
            doc
              .fontSize(10)
              .text(certificate.issuer);
          }

          doc.moveDown(0.5);
        });
      }

      doc.end();

      stream.on("finish", () => {
        resolve({
          fileName,
          filePath,
        });
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateResumePdf,
};