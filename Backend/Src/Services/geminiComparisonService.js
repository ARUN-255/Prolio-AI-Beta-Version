const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzeResumeComparisonWithAI = async ({
  resumeA,
  resumeB,
  comparison,
  requiredSkills = [],
  jobTitle = "",
  jobDescription = "",
}) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: `
You are an AI recruiter assistant.

Your task is to compare two resumes for a recruiter.

IMPORTANT RULES:
1. Use ONLY the information provided below.
2. Do not invent skills, experience, education, projects, certifications, or achievements.
3. Do not make decisions based on age, gender, race, religion, nationality, disability, marital status, or other protected personal characteristics.
4. Evaluate only job-relevant information.
5. The deterministic comparison data is factual application data and must not be contradicted.
6. If there is insufficient information to choose one resume, return "tie".
7. Keep the analysis concise and professional.
8. Return ONLY valid JSON. Do not include markdown or code fences.

JOB TITLE:
${jobTitle || "Not provided"}

JOB DESCRIPTION:
${jobDescription || "Not provided"}

REQUIRED SKILLS:
${JSON.stringify(requiredSkills)}

RESUME A:
${JSON.stringify(resumeA.resume_data || {})}

RESUME B:
${JSON.stringify(resumeB.resume_data || {})}

DETERMINISTIC COMPARISON:
${JSON.stringify(comparison)}

Return JSON in exactly this structure:

{
  "recommended_resume": "resume_a | resume_b | tie",
  "resume_a_strengths": [],
  "resume_a_gaps": [],
  "resume_b_strengths": [],
  "resume_b_gaps": [],
  "comparison_summary": "",
  "recommendation_reason": ""
}
`,
  });

  const text = response.text;

  if (!text) {
    throw new Error(
      "Gemini returned an empty comparison response"
    );
  }

  let cleanedText = text.trim();

  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error(
      "GEMINI COMPARISON JSON PARSE ERROR:",
      cleanedText
    );

    throw new Error(
      "Gemini returned invalid comparison JSON"
    );
  }
};

module.exports = {
  analyzeResumeComparisonWithAI,
};