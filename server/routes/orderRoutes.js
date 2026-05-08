const express = require('express');
const orderController = require('../controllers/orderController');
const { authMiddleWare, sellerOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/addOrder', authMiddleWare, orderController.addOrder);
router.get('/myOrders', authMiddleWare, sellerOnly, orderController.getSellerOrders);
router.get('/myOrders/:type', authMiddleWare, sellerOnly, orderController.getSellerOrdersBasedonType);
router.get('/getOrder/:id', authMiddleWare, sellerOnly, orderController.getOrder);
router.get('/traceOrder/:id', authMiddleWare, orderController.traceOrder);
router.put('/updateOrder/:id', authMiddleWare, sellerOnly, orderController.updateOrder);
router.delete('/removeOrder/:id', authMiddleWare, sellerOnly, orderController.removeOrder);

module.exports = router;
