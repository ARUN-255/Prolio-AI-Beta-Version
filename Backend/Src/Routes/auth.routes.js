const express = require("express");
const {protect, authorize,} = require("../Middleware/authMiddleware");
const router = express.Router();

const {register, login,} = require("../Controllers/Auth/authController");

router.post("/login",login);
router.post("/register",register);

router.get("/me",protect,(req,res) =>
{
    res.status(200).json({
        success:true,
        message:"Protect route accessed",
        user:req.user,
    });
});

router.get(
    "/student-test",
    protect,
    authorize("student"),
    (req,res) => {
        res.status(200).json({
            success:true,
            message:"student route accessed",
        });
    }
);

router.get(
    "/recruiter-test",
    protect,
    authorize("recruiter"),
    (req,res) => {
        res.status(200).json({
            success:true,
            message:"Recruiter route accessed",
        });
    }
);
module.exports = router;