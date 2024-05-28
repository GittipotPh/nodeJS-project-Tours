const express = require('express')
const router = express.Router(  { mergeParams: true });
const authController = require('./../controllers/authController.js');
const reviewController = require('./../controllers/reviewController.js');



router.use(authController.protect);

router.route('/')
.get(reviewController.getAllReviews)
.post(authController.restricTo('user'),reviewController.setTourUserIds ,reviewController.createReview);

router.route('/:id') 
.get(authController.protect,reviewController.getReview)
.delete(authController.restricTo('user', 'admin'),reviewController.deleteReview)
.patch(authController.restricTo('user', 'admin'), reviewController.updateReview);

module.exports = router;