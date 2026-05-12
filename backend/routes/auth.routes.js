const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register',authController.register);
router.post('/login',authController.login);
router.post('/verify-otp',authController.verifyOTP);
router.post('/forgot-password',authController.forgotPassword);

module.exports = router;