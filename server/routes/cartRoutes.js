const express = require('express')
const cartController = require('../controllers/cartController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router();



router.get('/getCart/', authMiddleware.authMiddleWare, cartController.getCart);
router.post('/addItem/', authMiddleware.authMiddleWare, cartController.addItemToCart);
router.patch('/decrementItem/:productId', authMiddleware.authMiddleWare, cartController.decrementItemQuantity);
router.delete('/removeItem/:productId', authMiddleware.authMiddleWare, cartController.removeItemFromCart);
router.delete('/clearCart/', authMiddleware.authMiddleWare, cartController.clearCart);

module.exports = router;
