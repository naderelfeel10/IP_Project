const express = require('express');
const { 
    createAccount, 
    signin, 
    activateAccount, 
    changePassword, 
    updateEmail, 
    deleteAccount 
} = require('../controllers/authController');

const router = express.Router();

router.post('/createAccount', createAccount);
router.post('/signin', signin);

router.patch('/activateAccount', activateAccount);
router.patch('/changePassword', changePassword);
router.patch('/updateEmail', updateEmail);

router.delete('/deleteAccount', deleteAccount);

module.exports = router;