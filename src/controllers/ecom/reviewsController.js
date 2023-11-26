const Review = require('../../schema/ecom/reviewModel');


// Get all reviews
exports.getAllReviews = (req, res) => {
    Review.find()
        .then((reviews) => {
            res.json(reviews);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error',err:err }));
};

// Get a review by ID
exports.getReviewById = (req, res) => {
    const reviewId = req.params.id;

    Review.findById(reviewId)
        .then((review) => {
            if (!review) {
                return res.status(404).json({ error: 'Review not found' });
            }
            res.json(review);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error',err:err }));
};

// Create a new review
exports.createReview = (req, res) => {
    const { user, product, rating, comment } = req.body;

    const newReview = new Review({
        user,
        product,
        rating,
        comment,
    });

    newReview
        .save()
        .then((review) => res.json(review))
        .catch((err) => res.status(500).json({ error: 'Internal Server Error',err:err }));
};

// Update a review
exports.updateReview = (req, res) => {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    Review.findByIdAndUpdate(
        reviewId,
        { rating, comment },
        { new: true }
    )
        .then((updatedReview) => {
            if (!updatedReview) {
                return res.status(404).json({ error: 'Review not found' });
            }
            res.json(updatedReview);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error',err:err }));
};

// Delete a review
exports.deleteReview = (req, res) => {
    const reviewId = req.params.id;

    Review.findByIdAndDelete(reviewId)
        .then((deletedReview) => {
            if (!deletedReview) {
                return res.status(404).json({ error: 'Review not found' });
            }
            res.json(deletedReview);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error',err:err }));
};


// Get reviews by user
exports.getReviewsByUser = (req, res) => {
    const userId = req.params.userId;

    Review.find({ user: userId })
        .then((reviews) => {
            res.json(reviews);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error' ,err:err}));
};

// Get reviews by product
exports.getReviewsByProduct = (req, res) => {
    const productId = req.params.productId;

    Review.find({ product: productId })
        .then((reviews) => {
            res.json(reviews);
        })
        .catch((err) => res.status(500).json({ error: 'Internal Server Error',err:err }));
};
