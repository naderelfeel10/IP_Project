const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleWare, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/flags', authMiddleWare, adminOnly, adminController.getAllFlags);
router.get('/users/:role/:id/flags', authMiddleWare, adminOnly, adminController.getUserFlags);
router.patch('/flags/:id/status', authMiddleWare, adminOnly, adminController.updateFlagStatus);
router.patch('/users/:id/status', authMiddleWare, adminOnly, adminController.updateUserStatus);

module.exports = router;
