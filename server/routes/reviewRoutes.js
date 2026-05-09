const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authMiddleWare } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/getComment/:id', reviewController.getComment);
router.get('/myReviews', authMiddleWare, reviewController.getMyReviews);
router.get('/getReviewsByProduct/:productId', reviewController.getReviewsByProductId);
router.get('/getReviewSummary/:productId', reviewController.getReviewSummary);
router.post('/addComment', authMiddleWare, reviewController.addComment);
router.post('/addComment/', authMiddleWare, reviewController.addComment);
router.put('/updateComment', authMiddleWare, reviewController.updateComment);
router.put('/updateComment/', authMiddleWare, reviewController.updateComment);
router.delete('/removeComment/:id', authMiddleWare, reviewController.removeComment);

module.exports = router;
