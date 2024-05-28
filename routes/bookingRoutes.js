const express = require('express')
const router = express.Router();
const bookingController = require('./../controllers/bookingController.js')

const authController = require('./../controllers/authController.js');

router.use(authController.protect);

router.get('/checkout-session/:tourId',
    bookingController.getCheckoutSession)

router.use(authController.restricTo('admin' , 'lead_guilde'));

router.route('/')
    .get(bookingController.getAllBooking)
    .post(bookingController.createBooking);

router.route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);


module.exports = router;