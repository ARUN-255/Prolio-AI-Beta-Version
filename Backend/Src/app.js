const pool = require("./Config/db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        success: true,
        message:"Prolio AI backend is running"
    });
});

app.get("/api/health",(req,res)=>{
    res.status(200).json({
        status:"ok",
        service: "Prolio AI API"
    });
});

app.get("/api/health",(req,res)=>{
    res.status(200).json({
        status: "ok",
        service: "Prolio AI API"
    });
});

const PORT = process.env.PORT || 5000;

pool.query("SELECT NOW()").then(()=>{
    console.log("Database test successful");
})
.catch((err)=>{
    console.error("Database test failed:",err.message);
});

app.listen(PORT,()=>{
    console.log(`Prolio AI server running on port ${PORT}`);
});