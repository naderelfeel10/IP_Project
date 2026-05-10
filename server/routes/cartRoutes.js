const express = require('express');
const cartController = require('../controllers/cartController');
const { authMiddleWare } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/getCart', authMiddleWare, cartController.getCart);
router.get('/getCart/', authMiddleWare, cartController.getCart);
router.post('/addItem', authMiddleWare, cartController.addItemToCart);
router.post('/addItem/', authMiddleWare, cartController.addItemToCart);
router.patch('/decrementItem/:productId', authMiddleWare, cartController.decrementItemQuantity);
router.delete('/removeItem/:productId', authMiddleWare, cartController.removeItemFromCart);
router.delete('/clearCart', authMiddleWare, cartController.clearCart);
router.delete('/clearCart/', authMiddleWare, cartController.clearCart);

module.exports = router;
