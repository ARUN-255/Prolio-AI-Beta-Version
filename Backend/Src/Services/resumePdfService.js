const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const DEFAULT_ORDER = [
  "summary",
  "experience",
  "projects",
  "education",
  "skills",
  "certificates",
];

const safeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const writeSectionTitle = (doc, title) => {
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(14).text(title);
  doc.moveDown(0.2);
  doc.font("Helvetica");
};

const writeEntry = (doc, heading, subheading, description, extra) => {
  if (heading) doc.font("Helvetica-Bold").fontSize(11).text(heading);
  if (subheading) doc.font("Helvetica").fontSize(10).text(subheading);
  if (description) doc.font("Helvetica").fontSize(9.5).text(description);
  if (extra) doc.font("Helvetica-Oblique").fontSize(9).text(extra);
  doc.font("Helvetica").moveDown(0.45);
};

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
      const personal = data.personal_info || {};
      const hiddenSections = Array.isArray(data.hidden_sections)
        ? data.hidden_sections
        : [];
      const savedOrder = Array.isArray(data.section_order)
        ? data.section_order
        : [];
      const sectionOrder = [
        ...savedOrder.filter((name) => DEFAULT_ORDER.includes(name)),
        ...DEFAULT_ORDER.filter((name) => !savedOrder.includes(name)),
      ].filter((name) => !hiddenSections.includes(name));

      const name = safeText(personal.name) || "Resume";
      doc.font("Helvetica-Bold").fontSize(22).text(name, { align: "center" });

      const headline = safeText(personal.headline);
      if (headline) {
        doc.font("Helvetica").fontSize(11).text(headline, { align: "center" });
      }

      const contactParts = [
        safeText(personal.location),
        safeText(personal.website),
        safeText(personal.linkedin),
        safeText(personal.github),
      ].filter(Boolean);

      if (contactParts.length > 0) {
        doc.moveDown(0.25);
        doc.font("Helvetica").fontSize(8.5).text(contactParts.join("  |  "), {
          align: "center",
        });
      }

      doc.moveDown(0.7);

      sectionOrder.forEach((sectionName) => {
        if (sectionName === "summary") {
          const summary = safeText(data.summary);
          if (!summary) return;
          writeSectionTitle(doc, "Summary");
          doc.font("Helvetica").fontSize(10).text(summary);
          return;
        }

        if (sectionName === "skills") {
          const skills = Array.isArray(data.skills) ? data.skills : [];
          if (skills.length === 0) return;
          writeSectionTitle(doc, "Skills");
          const text = skills
            .map((skill) => {
              if (typeof skill === "string") return safeText(skill);
              const nameText = safeText(skill?.name);
              const proficiency = safeText(skill?.proficiency);
              return proficiency ? `${nameText} (${proficiency})` : nameText;
            })
            .filter(Boolean)
            .join("  •  ");
          if (text) doc.font("Helvetica").fontSize(10).text(text);
          return;
        }

        if (sectionName === "experience") {
          const items = Array.isArray(data.experience) ? data.experience : [];
          if (items.length === 0) return;
          writeSectionTitle(doc, "Experience");
          items.forEach((item) => {
            const dates = [
              safeText(item.start_date),
              item.is_current ? "Present" : safeText(item.end_date),
            ].filter(Boolean).join(" - ");
            writeEntry(
              doc,
              safeText(item.role) || "Experience",
              safeText(item.company),
              safeText(item.description),
              dates
            );
          });
          return;
        }

        if (sectionName === "projects") {
          const items = Array.isArray(data.projects) ? data.projects : [];
          if (items.length === 0) return;
          writeSectionTitle(doc, "Projects");
          items.forEach((item) => {
            const tech = Array.isArray(item.tech_stack)
              ? item.tech_stack.filter(Boolean).join(" • ")
              : safeText(item.tech_stack);
            const extra = [tech, safeText(item.link)].filter(Boolean).join("  |  ");
            writeEntry(
              doc,
              safeText(item.title) || "Project",
              "",
              safeText(item.description),
              extra
            );
          });
          return;
        }

        if (sectionName === "education") {
          const items = Array.isArray(data.education) ? data.education : [];
          if (items.length === 0) return;
          writeSectionTitle(doc, "Education");
          items.forEach((item) => {
            const degree = [safeText(item.degree), safeText(item.field_of_study)]
              .filter(Boolean)
              .join(" - ");
            const years = [safeText(item.start_year), safeText(item.end_year)]
              .filter(Boolean)
              .join(" - ");
            const extra = [years, safeText(item.grade)].filter(Boolean).join("  |  ");
            writeEntry(
              doc,
              degree || "Education",
              safeText(item.institution),
              safeText(item.description),
              extra
            );
          });
          return;
        }

        if (sectionName === "certificates") {
          const items = Array.isArray(data.certificates) ? data.certificates : [];
          if (items.length === 0) return;
          writeSectionTitle(doc, "Certificates");
          items.forEach((item) => {
            const extra = [safeText(item.date), safeText(item.file_url)]
              .filter(Boolean)
              .join("  |  ");
            writeEntry(
              doc,
              safeText(item.title) || "Certificate",
              safeText(item.issuer),
              "",
              extra
            );
          });
        }
      });

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
