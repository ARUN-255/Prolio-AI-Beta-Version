const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiter.controller');

router.post('/profile',recruiterController.createProfile);
router.get('/profile/:user_id',recruiterController.getProfile);

module.exports = router;
