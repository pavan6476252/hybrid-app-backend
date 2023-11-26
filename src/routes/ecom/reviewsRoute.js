const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/ecom/reviewsController');

router.get('/reviews', reviewController.getAllReviews);
router.get('/reviews/:id', reviewController.getReviewById);
router.get('/reviews/user/:userId', reviewController.getReviewsByUser);
router.get('/reviews/product/:productId', reviewController.getReviewsByProduct);
router.post('/reviews', reviewController.createReview);
router.put('/reviews/:id', reviewController.updateReview);
router.delete('/reviews/:id', reviewController.deleteReview);

module.exports = router;
