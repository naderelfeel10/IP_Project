const express = require('express')
const cartController = require('../controllers/cartController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router();



router.get('/myCart/',authMiddleware.authMiddleWare, cartController.getCart);
router.post('/createCart/',authMiddleware.authMiddleWare,cartController.createCart);
router.put('/clearCart/:id',authMiddleware.authMiddleWare, cartController.clearCart);

module.exports = router;