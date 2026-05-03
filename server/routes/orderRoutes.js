const express = require('express')
const orderController = require('../controllers/orderController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router();



router.get('/getOrder/:id',authMiddleware.authMiddleWare, orderController.getOrder);
router.post('/addOrder/',authMiddleware.authMiddleWare,orderController.addOrder);
router.put('/updateOrder/:id',authMiddleware.authMiddleWare,orderController.updateOrder);

router.delete('/removeOrder/:id',authMiddleware.authMiddleWare,orderController.removeOrder);
router.get('/traceOrder/:id',authMiddleware.authMiddleWare,orderController.traceOrder);
router.get('/myOrders/',authMiddleware.authMiddleWare, orderController.getBuyerOrders);

router.get('/myOrders/:status/',authMiddleware.authMiddleWare, orderController.getSellerOrdersBasedonStatus);



module.exports = router;