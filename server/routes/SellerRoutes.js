const express = require('express')
const SellerController = require('../controllers/SellerController')
const router = express.Router();



router.get('/getProfile/',SellerController.getProfile);
router.get('/getSellerStore',SellerController.getSellerStore);
router.patch('/flagBuyer/',SellerController.flagBuyer);

router.patch('/:id/status', SellerController.changeProductStatus);


module.exports = router;