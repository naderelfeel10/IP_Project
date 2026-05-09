const express = require('express');
const orderController = require('../controllers/orderController');
const { authMiddleWare } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/addOrder', authMiddleWare, orderController.addOrder);
router.post('/addOrder/', authMiddleWare, orderController.addOrder);
router.get('/myOrders', authMiddleWare, orderController.getSellerOrders);
router.get('/myOrders/', authMiddleWare, orderController.getSellerOrders);
router.get('/myOrders/:type', authMiddleWare, orderController.getSellerOrdersBasedonType);
router.get('/getAllOrders', authMiddleWare, orderController.getAllOrders);
router.get('/getAllOrders/', authMiddleWare, orderController.getAllOrders);
router.get('/getOrder/:id', authMiddleWare, orderController.getOrder);
router.get('/traceOrder/:id', authMiddleWare, orderController.traceOrder);
router.put('/updateOrder/:id', authMiddleWare, orderController.updateOrder);
router.patch('/progressOrder/:id', authMiddleWare, orderController.progressOrderStatus);
router.post('/reportIssue/:id', authMiddleWare, orderController.reportIssue);
router.delete('/removeOrder/:id', authMiddleWare, orderController.removeOrder);

module.exports = router;
