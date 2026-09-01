require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./Config/db");

const {
  connectRedis,
} = require("./Config/redis");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // CONNECT REDIS FIRST
    await connectRedis();

    // LOAD ROUTES ONLY AFTER REDIS IS READY
    const authRoutes =
      require("./Routes/auth.routes");

    const studentRoutes =
      require("./Routes/student.routes");

    const publicRoutes =
      require("./Routes/public.routes");

    const recruiterRoutes =
      require("./Routes/recruiter.routes");

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use(
      "/api/auth",
      authRoutes
    );

    app.use(
      "/api/students",
      studentRoutes
    );

    app.use(
      "/api/public",
      publicRoutes
    );

    app.use(
      "/api/recruiter",
      recruiterRoutes
    );

    app.get("/", (req, res) => {
      res.json({
        success: true,
        message:
          "Prolio AI backend is running",
      });
    });

    app.get(
      "/api/health",
      (req, res) => {
        res.status(200).json({
          status: "ok",
          service:
            "Prolio AI API",
        });
      }
    );

    await pool.query("SELECT NOW()");

    console.log(
      "Database test successful"
    );

    app.listen(PORT, () => {
      console.log(
        `Prolio AI server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "SERVER STARTUP ERROR:",
      error
    );

    process.exit(1);
  }
};

startServer();