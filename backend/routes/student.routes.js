const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

router.post('/profile',studentController.createProfile);
router.get('/profile/:user_id',studentController.getProfile);
router.put('/profile/:user_id',studentController.updateProfile);
module.exports = router;