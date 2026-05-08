const express = require('express');
const productController = require('../controllers/productController');
const { authMiddleWare, sellerOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/catalog', productController.browseCatalog);
router.get('/search', productController.searchProduct);

router.get('/categories', authMiddleWare, sellerOnly, productController.viewProductsCategories);
router.get('/my-products', authMiddleWare, sellerOnly, productController.getSellerProducts);
router.get('/getProduct/:id', authMiddleWare, sellerOnly, productController.getProduct);

router.post('/addProduct', authMiddleWare, sellerOnly, productController.addProduct);
router.put('/updateProduct/:id', authMiddleWare, sellerOnly, productController.updateProduct);
router.delete('/removeProduct/:id', authMiddleWare, sellerOnly, productController.removeProduct);
router.patch('/:id/status', authMiddleWare, sellerOnly, productController.changeProductStatus);

module.exports = router;
