require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const testGemini = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Reply only with: Gemini connection successful",
    });

    console.log(response.text);
  } catch (error) {
    console.error("GEMINI TEST ERROR:");
    console.error(error);
  }
};

testGemini();