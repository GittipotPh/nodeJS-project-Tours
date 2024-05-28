const Review = require('./../models/reviewModel');
const catchAsync = require('./../utilis/catchAsync');
const factoryControl = require('./../controllers/handlerFactory');


exports.setTourUserIds = (req, res , next) => {

    if(!req.body.tour) req.body.tour = req.params.tourId; 
    if(!req.body.user) req.body.user = req.user.id;

    next();
};

exports.createReview = factoryControl.createOne(Review);
exports.getAllReviews = factoryControl.getAll(Review);
exports.getReview = factoryControl.getOne(Review);
exports.deleteReview = factoryControl.deleteOne(Review);
exports.updateReview = factoryControl.updateOne(Review);



// exports.createReview = catchAsync( async function(req , res , next){

    
//     const review = await Review.create({

//         review : req.body.review,
//         rating : req.body.rating,
//         tour : req.body.tour, // tour id
//         user : req.user.id,

//     });

//     res.status(201).json({ status: 'success' , review: review });
// });
