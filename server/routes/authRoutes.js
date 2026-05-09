const express = require('express');
const { authMiddleWare } = require('../middlewares/authMiddleware');
const { 
    createAccount, 
    signin, 
    logout,
    activateAccount, 
    resendCode,
    changePassword, 
    updateEmail, 
    deleteAccount 
} = require('../controllers/authController');

const router = express.Router();

router.post('/createAccount', createAccount);
router.post('/signin', signin);
router.post('/logout', logout);

router.patch('/activateAccount', activateAccount);
router.post('/resendCode', resendCode);
router.patch('/changePassword', authMiddleWare, changePassword);
router.patch('/updateEmail', authMiddleWare, updateEmail);

router.delete('/deleteAccount', authMiddleWare, deleteAccount);

module.exports = router;
