const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const getAiAtsFeedback = async ({
  resumeData,
  jobTitle,
  jobDescription,
}) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: `
You are an ATS resume analysis assistant.

Analyze the resume against the given job description.

Do not invent skills, experience, education, projects, or achievements.

JOB TITLE:
${jobTitle || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

RESUME DATA:
${JSON.stringify(resumeData)}
`,

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: "object",

        properties: {
          summary: {
            type: "string",
          },

          strengths: {
            type: "array",
            items: {
              type: "string",
            },
          },

          improvements: {
            type: "array",
            items: {
              type: "string",
            },
          },

          recommended_keywords: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },

        required: [
          "summary",
          "strengths",
          "improvements",
          "recommended_keywords",
        ],
      },
    },
  });

  return JSON.parse(response.text);
};

module.exports = {
  getAiAtsFeedback,
};