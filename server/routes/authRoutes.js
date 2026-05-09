const express = require('express');
const { 
    createAccount, 
    signin, 
    logout,
    activateAccount, 
    changePassword, 
    updateEmail, 
    deleteAccount 
} = require('../controllers/authController');

const router = express.Router();

router.post('/createAccount', createAccount);
router.post('/signin', signin);
router.post('/logout', logout);

router.patch('/activateAccount', activateAccount);
router.patch('/changePassword', changePassword);
router.patch('/updateEmail', updateEmail);

router.delete('/deleteAccount', deleteAccount);

module.exports = router;
