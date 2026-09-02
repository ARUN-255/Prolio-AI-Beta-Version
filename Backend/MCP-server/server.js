const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const {
  getCandidateContext,
} = require("./Tools/getCandidateContext");

const {
  getJobContext,
} = require("./Tools/getJobContext");

const {
  McpServer,
} = require("@modelcontextprotocol/sdk/server/mcp.js");

const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");

const { z } = require("zod");

const {
  getProfileData,
} = require("./Tools/getProfileData");

const {
  getResumeData,
} = require("./Tools/getResumeData");

const server = new McpServer({
  name: "prolio-ai-mcp",
  version: "1.0.0",
});

// HEALTH CHECK
server.registerTool(
  "prolio_health",
  {
    description:
      "Check whether the Prolio AI MCP server is working",
    inputSchema: z.object({}),
  },
  async () => {
    return {
      content: [
        {
          type: "text",
          text:
            "Prolio AI MCP server is working.",
        },
      ],
    };
  }
);

// GET PROFILE DATA
server.registerTool(
  "get_profile_data",
  {
    description:
      "Get structured student profile data using a user ID",
    inputSchema: z.object({
      userId: z.number().int().positive(),
    }),
  },
  async ({ userId }) => {
    try {
      const profileData =
        await getProfileData(userId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              profileData,
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              error.message ||
              "Unable to fetch profile data",
          },
        ],
      };
    }
  }
);

// GET RESUME DATA
server.registerTool(
  "get_resume_data",
  {
    description:
      "Get structured resume data. Public resumes can be accessed with resumeId only. Private resumes require the owner's userId.",

    inputSchema: z.object({
      resumeId: z.number().int().positive(),

      userId: z
        .number()
        .int()
        .positive()
        .optional(),
    }),
  },

  async ({
    resumeId,
    userId,
  }) => {
    try {
      const resumeData =
        await getResumeData({
          resumeId,
          userId,
        });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              resumeData,
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,

        content: [
          {
            type: "text",
            text:
              error.message ||
              "Unable to fetch resume data",
          },
        ],
      };
    }
  }
);

server.registerTool(
  "get_candidate_context",
  {
    description:
      "Get public recruiter-safe candidate context using a student user ID",

    inputSchema: z.object({
      userId: z.number().int().positive(),
    }),
  },

  async ({ userId }) => {
    try {
      const candidateContext =
        await getCandidateContext(userId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              candidateContext,
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,

        content: [
          {
            type: "text",
            text:
              error.message ||
              "Unable to fetch candidate context",
          },
        ],
      };
    }
  }
);

server.registerTool(
  "get_job_context",
  {
    description:
      "Normalize and validate recruiter job context",

    inputSchema: z.object({
      jobTitle: z
        .string()
        .optional(),

      jobDescription: z
        .string()
        .optional(),

      requiredSkills: z
        .array(z.string())
        .optional(),
    }),
  },

  async ({
    jobTitle,
    jobDescription,
    requiredSkills,
  }) => {
    try {
      const jobContext =
        getJobContext({
          jobTitle,
          jobDescription,
          requiredSkills,
        });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              jobContext,
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,

        content: [
          {
            type: "text",
            text:
              error.message ||
              "Unable to build job context",
          },
        ],
      };
    }
  }
);

const startServer = async () => {
  const transport =
    new StdioServerTransport();

  await server.connect(transport);
};

startServer().catch((error) => {
  console.error(
    "MCP SERVER ERROR:",
    error
  );

  process.exit(1);
});