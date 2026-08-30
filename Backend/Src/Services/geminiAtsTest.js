require("dotenv").config();

const {
  getAiAtsFeedback,
} = require("./geminiAtsService");

const testGeminiAts = async () => {
  try {
    const result = await getAiAtsFeedback({
      jobTitle: "Software Engineer Intern",

      jobDescription:
        "We are looking for a Software Engineer Intern with experience in JavaScript, React, Node.js, Express, PostgreSQL, AWS, Git, REST APIs and Docker. The candidate should understand scalable web applications, backend development, database design and cloud deployment.",

      resumeData: {
        personal_info: {
          name: "Test User 6",
          headline:
            "Software Engineer | Full Stack Developer",
        },

        summary:
          "Software engineer focused on building scalable web applications.",

        skills: [
          "JavaScript",
          "React",
          "Node.js",
          "Express",
          "PostgreSQL",
          "AWS",
        ],

        experience: [],
        projects: [],
        education: [],
        certificates: [],
      },
    });

    console.log(
      JSON.stringify(result, null, 2)
    );
  } catch (error) {
    console.error("GEMINI ATS TEST ERROR:");
    console.error(error);
  }
};

testGeminiAts();