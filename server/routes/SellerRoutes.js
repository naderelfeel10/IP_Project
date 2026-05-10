const express = require('express');
const SellerController = require('../controllers/SellerController');
const { authMiddleWare, sellerOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/getAllSellers', SellerController.getAllSellers);
router.get('/getProfile', authMiddleWare, sellerOnly, SellerController.getProfile);
router.put('/profile', authMiddleWare, sellerOnly, SellerController.updateProfile);
router.get('/getSellerStore', authMiddleWare, sellerOnly, SellerController.getSellerStore);
router.post('/flagBuyer', authMiddleWare, sellerOnly, SellerController.flagBuyer);
router.get('/flags', authMiddleWare, sellerOnly, SellerController.getMyFlags);
router.patch('/serviceArea', authMiddleWare, sellerOnly, SellerController.updateServiceArea);

module.exports = router;
