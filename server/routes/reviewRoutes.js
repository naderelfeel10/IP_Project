const express = require('express')
const reviewController = require('../controllers/reviewController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router();



router.get('/getComment/:id',reviewController.getComment);
router.get('/myReviews', authMiddleware.authMiddleWare, reviewController.getMyReviews);
router.get('/getReviewsByProduct/:productId',reviewController.getReviewsByProductId);
router.get('/getReviewSummary/:productId',reviewController.getReviewSummary);
router.post('/addComment/', authMiddleware.authMiddleWare, reviewController.addComment);
router.put('/updateComment/', authMiddleware.authMiddleWare, reviewController.updateComment);
router.delete('/removeComment/',reviewController.removeComment);


module.exports = router;
