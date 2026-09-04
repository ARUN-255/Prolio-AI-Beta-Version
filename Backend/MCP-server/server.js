const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const {
  McpServer,
} = require(
  "@modelcontextprotocol/sdk/server/mcp.js"
);

const {
  StdioServerTransport,
} = require(
  "@modelcontextprotocol/sdk/server/stdio.js"
);

const { z } = require("zod");

// MCP TOOLS
const {
  getCandidateContext,
} = require(
  "./Tools/getCandidateContext"
);

const {
  getJobContext,
} = require(
  "./Tools/getJobContext"
);

const {
  getResumeData,
} = require(
  "./Tools/getResumeData"
);


// ========================================
// CREATE MCP SERVER
// ========================================

const server = new McpServer({
  name: "prolio-ai-mcp",
  version: "1.0.0",
});


// ========================================
// 1. HEALTH CHECK
// ========================================

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


// ========================================
// 2. GET PUBLIC RESUME DATA
// ========================================

server.registerTool(
  "get_resume_data",
  {
    description:
      "Get structured data for a public student resume using a resume ID.",

    inputSchema: z.object({
      resumeId:
        z.number()
          .int()
          .positive(),
    }),
  },

  async ({ resumeId }) => {
    try {
      const resumeData =
        await getResumeData({
          resumeId,
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
              "Unable to fetch public resume data",
          },
        ],
      };
    }
  }
);


// ========================================
// 3. GET PUBLIC CANDIDATE CONTEXT
// ========================================

server.registerTool(
  "get_candidate_context",
  {
    description:
      "Get public recruiter-safe candidate context using a student's public profile slug.",

    inputSchema: z.object({
      publicSlug:
        z.string()
          .trim()
          .min(1)
          .max(100),
    }),
  },

  async ({ publicSlug }) => {
    try {
      const candidateContext =
        await getCandidateContext(
          publicSlug
        );

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


// ========================================
// 4. GET JOB CONTEXT
// ========================================

server.registerTool(
  "get_job_context",
  {
    description:
      "Normalize and validate recruiter job context",

    inputSchema: z.object({
      jobTitle:
        z.string()
          .optional(),

      jobDescription:
        z.string()
          .optional(),

      requiredSkills:
        z.array(
          z.string()
        ).optional(),
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


// ========================================
// START MCP SERVER
// ========================================

const startServer = async () => {
  const transport =
    new StdioServerTransport();

  await server.connect(
    transport
  );
};

startServer().catch(
  (error) => {
    console.error(
      "MCP SERVER ERROR:",
      error
    );

    process.exit(1);
  }
);