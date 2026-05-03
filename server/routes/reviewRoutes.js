const express = require('express')
const reviewController = require('../controllers/reviewController')
const router = express.Router();



router.get('/getComment/:id',reviewController.getComment);
router.post('/addComment/',reviewController.addComment);
router.put('/updateComment/',reviewController.updateComment);
router.delete('/removeComment/',reviewController.removeComment);


module.exports = router;