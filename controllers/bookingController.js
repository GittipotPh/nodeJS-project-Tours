const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utilis/catchAsync');
const AppError = require('../utilis/appError');
const factoryControl = require('../controllers/handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) {
        return next(new AppError('No tour found', 404));
    }

    let product, price;

    try {
        product = await stripe.products.create({
            name: tour.name,
            description: tour.summary,
        });
    } catch (err) {
        console.error('Error creating product:', err);
        return next(new AppError('Error creating product', 500));
    }

    try {
        price = await stripe.prices.create({
            unit_amount: tour.price * 100, // Stripe expects the amount in cents
            currency: 'usd',
            // recurring: {
            //     interval: 'month',
            // },
            product: product.id,
        });
    } catch (err) {
        console.error('Error creating price:', err);
        return next(new AppError('Error creating price', 500));
    }

    console.log('Success! Tour product ID:', product.id);
    console.log('Success! Tour price ID:', price.id);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {   
                price: price.id, // Stripe expects the amount in cents
                quantity: 1
            }
        ],
        mode: 'payment' // Move the mode parameter to the top level
    
    });


    res.status(200).json({
        status: 'success',
        session
    });
});



exports.createBookingCheckout = catchAsync( async (req, res , next) => {
    //This is only temporary, Because it's unsecure: evertone can make booking without payment
    const { tour, user, price } = req.query;

    if(!tour && !user && !price) return next();
    await Booking.create({ tour: tour, user: user, price: price});

    console.log(req.originalUrl);
    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factoryControl.createOne(Booking);
exports.getBooking = factoryControl.getOne(Booking);
exports.getAllBooking = factoryControl.getAll(Booking);
exports.updateBooking = factoryControl.updateOne(Booking);
exports.deleteBooking = factoryControl.deleteOne(Booking);