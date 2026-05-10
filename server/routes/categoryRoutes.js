const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authMiddleWare, sellerOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleWare, sellerOnly, categoryController.getCategories);
router.post('/', authMiddleWare, sellerOnly, categoryController.createCategory);
router.put('/:id', authMiddleWare, sellerOnly, categoryController.updateCategory);
router.delete('/:id', authMiddleWare, sellerOnly, categoryController.deleteCategory);

module.exports = router;
