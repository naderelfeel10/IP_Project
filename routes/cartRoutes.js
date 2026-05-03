const express = require('express')
const cartController = require('../controllers/cartController')
const router = express.Router();



router.get('/getCart/',cartController.getCart);
router.post('/createCart/',cartController.createCart);
router.delete('/clearCart/',cartController.clearCart);

module.exports = router;