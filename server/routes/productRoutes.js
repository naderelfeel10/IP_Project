const express = require('express');
const productController = require('../controllers/productController');
const { authMiddleWare, sellerOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/catalog', productController.browseCatalog);
router.get('/search', productController.searchProduct);
router.get('/categories', productController.getAllCategories);
router.get('/categories/:cat_name', productController.getCategory);
router.get('/getProduct/:id', productController.getProduct);
router.get('/getSellerProducts/:id', productController.getPublicSellerProducts);

router.get('/my-products', authMiddleWare, sellerOnly, productController.getSellerProducts);
router.get('/seller-categories', authMiddleWare, sellerOnly, productController.viewProductsCategories);
router.post('/addProduct', authMiddleWare, sellerOnly, productController.addProduct);
router.put('/updateProduct/:id', authMiddleWare, sellerOnly, productController.updateProduct);
router.delete('/removeProduct/:id', authMiddleWare, sellerOnly, productController.removeProduct);
router.patch('/:id/status', authMiddleWare, sellerOnly, productController.changeProductStatus);

module.exports = router;
