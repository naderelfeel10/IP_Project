const express = require('express')
const buyerController = require('../controllers/BuyerController')
const router = express.Router();



router.get('/getProfile/',buyerController.getProfile);
router.get('/getPurchaseHistroy',buyerController.getPurchaseHistroy);
router.patch('/flagSeller/',buyerController.flagSeller);


module.exports = router;