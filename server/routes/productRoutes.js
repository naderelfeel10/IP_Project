const express = require('express')
const productController = require('../controllers/productController')
const AutoMiddleware = require('../middlewares/authMiddleware')
const router = express.Router();


router.post('/addProduct/',AutoMiddleware.authMiddleWare, productController.addProduct);
router.get('/getProduct/:id',productController.getProduct);
router.put('/updateProduct/:id',AutoMiddleware.authMiddleWare,productController.updateProduct);
router.delete('/removeProduct/:id',AutoMiddleware.authMiddleWare,productController.removeProduct);

//front end
router.get('/search', productController.searchProduct);

router.get('/catalog', productController.browseCatalog);
router.get('/categories', productController.getAllCategories);
router.get('/categories/:cat_name', productController.getCategory);

router.get('/my-products/', AutoMiddleware.authMiddleWare,productController.getMyProducts);
router.get('/getSellerProducts/:id', productController.getSellerProducts);


module.exports = router;