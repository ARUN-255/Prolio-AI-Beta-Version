require("dotenv").config();

const {
  askPortfolioChatbot,
} = require("./chatbotService");

const testChatbot = async () => {
  try {
    const answer = await askPortfolioChatbot({
      portfolioData: {
        user: {
          name: "Test User 6",
        },

        profile: {
          headline:
            "Software Engineer | Full Stack Developer",
          bio:
            "Focused on building scalable web applications.",
        },

        skills: [
          "JavaScript",
          "React",
          "Node.js",
          "Express",
          "PostgreSQL",
          "AWS",
        ],

        projects: [
          {
            title: "Prolio AI",
            description:
              "AI-powered career platform with resume tools, portfolio features, ATS analysis, and recruiter tools.",
          },
        ],

        education: [],
        experiences: [],
        certificates: [],
      },

      question:
  "Does this person know Python and Docker?",
    });

    console.log("CHATBOT ANSWER:");
    console.log(answer);
  } catch (error) {
    console.error("CHATBOT TEST ERROR:");
    console.error(error);
  }
};

testChatbot();