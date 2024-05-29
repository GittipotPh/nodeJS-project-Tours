const catchAsync = require("../utilis/catchAsync");
const AppError = require('./../utilis/appError');
const APIFeature = require('./../utilis/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    console.log('code Reach here');
    console.log(req.params.id);

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No tour found', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});


exports.updateOne = Model => catchAsync(async (req, res, next) => {

        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!doc) next(new AppError('No tour found', 404));


        res.status(200).json({ 
            status: 'success', 
            data: { data : doc}
        });
    
        
    });
 
exports.createOne = Model => catchAsync(async(req, res, next) => {

    const doc = await Model.create(req.body);

    res.status(200).json({ status : 'success', data : { doc }});});

// comment
exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    
    const doc = await query;

    if(!doc) next(new AppError('No doc found with that ID', 404));

    // if (!GetTour) {
    //     throw new AppError('Tour not found', 404);
    // }

    // if (!GetTour) return next(new AppError('Tour not found ID', 404));

    res.status(200).json({ status : 'success' , data : { data : doc }});
});


exports.getAll = Model => catchAsync(async (req, res) => {

    //To allow for nested Get reviews on tourID

    let filter = {};

    if(req.params.tourId ) filter = { tour: req.params.tourId };

    const features = new APIFeature(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitField()
    .paginate();

    const doc = await features.query;       //.explain();

    


res.status(200).json({ status : 'success', results: doc.length ,data : { data: doc}

});});


// exports.deleteTour = catchAsync(async (req, res) => {
    

//         const tour = await Tour.findByIdAndDelete(req.params.id);

//         if(!tour) next( new AppError('No tour found', 404) );

//         res.status(204).json({ 
//             status: 'success', 
//             data: null
//         });
        