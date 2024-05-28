const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingsController = require('./../controllers/bookingController');


// router.get('/', (req, res) => {
//     res.status(200).render('base', {
//         tour: 'The Forest Hiker',
//         user: 'Jonas'
//     });

router.get('/',bookingsController.createBookingCheckout ,authController.isLoggedIn, viewController.getOverview);


router.get('/login',authController.isLoggedIn, viewController.getLoginForm ); 
router.get('/tour/:slug',authController.isLoggedIn, viewController.getTour);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);



router.post('/submit-user-data' ,authController.protect, viewController.updateUserData);


// router.get('/tour', (req, res) => {
//     res.status(200).render('overview', {
//         title: 'The Forest Hiker Tour'
//     });
// });

module.exports = router;