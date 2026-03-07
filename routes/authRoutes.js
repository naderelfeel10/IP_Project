const express = require('express')
const authController = require('../controllers/authController')
const router = express.Router();

router.post('/sginup',authController.signup);
router.get('/sginup',authController.signup_get);

router.post('/sginin',authController.signin);
router.get('/sginin',authController.signin_get);

module.exports = router;