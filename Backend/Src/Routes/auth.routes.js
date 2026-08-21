const express = require("express");
const router = express.Router();

const {register} = require("../Controllers/Auth/authController");

router.post("/register",register);

module.exports = router;