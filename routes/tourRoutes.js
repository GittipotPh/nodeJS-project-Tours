
const express = require('express');
const tourController = require('./../controllers/tourController');
const router = express.Router();
const authorization = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');



//router.param('id',tourController.checkID);


// Redirect to the other router
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap')
.get(tourController.aliasTopTours,tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authorization.protect, 
authorization.restricTo('admin', 'lead-guide','guide'),tourController.getMonthlyPlan);


router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
// /tours-distance?distance=223&center=-40,45&unit=mi
// /tours-distance/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/')
.get(tourController.getAllTours)
.post(authorization.protect, authorization.restricTo('lead-guide', 'admin'),tourController.createTour);
//.post(tourController.checkBody, tourController.createTour)

router.route('/:id')
.get(tourController.getTour)
.delete(authorization.protect, authorization.restricTo('admin', 'lead-guide'),
tourController.deleteTour)
.patch(authorization.protect, authorization.restricTo('admin', 'lead-guide')
,tourController.uploadTourImages, tourController.resizeTourImages ,tourController.patchTour);

// router.route('/:tourId/reviews')
// .post(authorization.protect,authorization.restricTo('user'), reviewController.createReview)


module.exports = router;