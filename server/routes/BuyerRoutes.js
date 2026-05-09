const express = require('express');
const buyerController = require('../controllers/BuyerController');
const { authMiddleWare } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/getAllBuyers', buyerController.getAllBuyers);
router.get('/getProfile', authMiddleWare, buyerController.getProfile);
router.get('/getPurchaseHistroy', authMiddleWare, buyerController.getPurchaseHistroy);
router.patch('/flagSeller', authMiddleWare, buyerController.flagSeller);

module.exports = router;
