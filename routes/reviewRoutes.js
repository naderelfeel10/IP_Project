const express = require('express')
const reviewController = require('../controllers/reviewController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router();



router.get('/getComment/:id',authMiddleware.authMiddleWare, reviewController.getComment);
router.post('/addComment/:id',authMiddleware.authMiddleWare, reviewController.addComment);
router.put('/updateComment/:id',authMiddleware.authMiddleWare, reviewController.updateComment);
router.delete('/removeComment/:id',authMiddleware.authMiddleWare, reviewController.removeComment);


module.exports = router;