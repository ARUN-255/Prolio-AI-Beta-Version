const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzeProjectWithAI = async ({
  project,
  analysis,
  requiredSkills = [],
  jobTitle = "",
  jobDescription = "",
}) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: `
You are an AI recruiter assistant analyzing a candidate project.

IMPORTANT RULES:
1. Use ONLY the project information provided below.
2. Do not invent technologies, achievements, users, metrics, architecture, deployment details, or features.
3. Evaluate only job-relevant technical information.
4. Do not use protected personal characteristics in the evaluation.
5. The deterministic analysis is factual application data and must not be contradicted.
6. If information is missing, clearly identify it as missing instead of assuming it.
7. Keep the response concise and professional.
8. Return ONLY valid JSON. Do not include markdown or code fences.

JOB TITLE:
${jobTitle || "Not provided"}

JOB DESCRIPTION:
${jobDescription || "Not provided"}

REQUIRED SKILLS:
${JSON.stringify(requiredSkills)}

PROJECT:
${JSON.stringify({
  title: project.title,
  description: project.description,
  tech_stack: project.tech_stack,
  link: project.link,
})}

DETERMINISTIC ANALYSIS:
${JSON.stringify(analysis)}

Return exactly this JSON structure:

{
  "project_quality": "weak | average | good | strong",
  "technical_strengths": [],
  "technical_gaps": [],
  "recruiter_feedback": "",
  "improvement_suggestions": [],
  "job_relevance": ""
}
`,
  });

  const text = response.text;

  if (!text) {
    throw new Error(
      "Gemini returned an empty project analysis response"
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
      "GEMINI PROJECT ANALYSIS JSON PARSE ERROR:",
      cleanedText
    );

    throw new Error(
      "Gemini returned invalid project analysis JSON"
    );
  }
};

module.exports = {
  analyzeProjectWithAI,
};