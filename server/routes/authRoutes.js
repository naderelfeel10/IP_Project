const express = require('express')
const authController = require('../controllers/authController')
const router = express.Router();



router.post('/createAccount',authController.createAccount);
router.post('/signin',authController.signin);
router.post('/sginin',authController.signin);

router.patch('/activateAccount',authController.activateAccount);
router.patch('/changePasword',authController.changePassword);
router.patch('/updateEmail',authController.updateEmail);

router.delete('/deleteAccount',authController.deleteAccount);

module.exports = router;
