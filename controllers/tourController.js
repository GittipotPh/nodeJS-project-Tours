//const fs = require('fs');
const Tour = require('./../models/tourModel');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('./../utilis/appError');
const catchAsync = require('./../utilis/catchAsync');
const factoryControl = require('./../controllers/handlerFactory');


const multerStorage = multer.memoryStorage();  //store as buffer

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    }else {
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }

};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.resizeTourImages = catchAsync( async (req, res, next) => {
    console.log(req.body.imageCover);

    console.log(req.files[1]);

    if(!req.files.imageCover || !req.files.images) return next();

    //1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    // console.log(imageCoverFilename);
    await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

    // req.body.imageCover = imageCoverFilename;

    // 2) Images


    req.body.images = [];

    await Promise.all
    (req.files.images.map( async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;


    // await sharp(req.files.images[i].buffer)
    await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90 })
        .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);

    })
    );

    next(); 

});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

// upload.single('images')
// upload.array('images', 5)

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
/*
exports.checkID = (req ,res, next , val) =>{
    console.log(val);
    if(req.params.id*1 > tours.length){
        return res.status(404).json({status:'fail',message:'Invalid ID'});
    }

    next();
};
*/
//exports.checkBody = (req ,res, next ) =>{
//    if (!req.body.name || !req.body.price) return res.status(400).json({status:'fail',message:"Missing name or price"});  
//    next();
//};
exports.aliasTopTours = (req ,res, next) =>{
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    req.query.sort = '-ratingAverage,price';
    req.query.limit = '5';
    next();

};


exports.getTourStats = catchAsync(async (req, res) => {
    
        const stats = await Tour.aggregate([
            {
                $match: { $or : [ {ratingAverage: { $gt: 2} }, { ratingsAverage: { $gt: 2}}] }
            },
            {
                $group: {
                    _id: {$toUpper: '$difficulty'},
                    num: {$sum: 1},
                    numRating: { $sum: '$ratingQuantity'},
                    avgRating: { $avg: '$ratingAverage'},
                    avgPrice: { $avg: '$price'},
                    minPrice: { $min: '$price'},
                    maxPrice: { $max: '$price'}
                }
            },
            {
                $sort: {
                    avgPrice :-1
                }
            },
            // {
            //     $match: {_id: { $ne: 'EASY'}}
            // }

        ]);

        if (!stats) return next(new AppError('Tour not found ID', 404));
        res.status(200).json({ status: 'success', data: { stats } });


});

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year *1 ;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: { 
                        $gte: new Date(`${year}-02-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                },
            },
            {
                $group: {
                    _id: { $month: '$startDates'},
                    numTourStat : { $sum: 1},
                    tours: { $push :{$toUpper: '$name'} }
                }
            },
            {
                $addFields: {
                    month: '$_id'
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort :{ 
                    numTourStat : -1
                }
            },
            {
                $limit : 6
            }

        ]);

        res.status(200).json({ status: 'success',results: plan.length, data: { plan } });
    } catch(err) {
        res.status(404).json({ status: 'fail', message: err.message});
    }

}





exports.getAllTours = factoryControl.getAll(Tour);

    

        //build Query
        // 1A) Filtering
        // const queryObj = {...req.query};
        // const excludeFields = ['page', 'sort', 'limit', 'fields'];
        // excludeFields.forEach(el => delete queryObj[el]);

        // // 1B) Advance Filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // console.log(JSON.parse(queryStr));
     
        // let query = TourModel.find(JSON.parse(queryStr));
        
        // 2) Sorting
        // if (req.query.sort) {
           
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     query = query.sort(sortBy);
        //     // sort('price ratingAverage')
        // }else {
        //     query = query.sort('-createdAt');
        // }


        // 3) Field limiting
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }else {
        //     query = query.select('-__v')
        // }

        // 4) Pagination
        // const page = req.query.page * 1 || 1;
        //     const limit = req.query.limit *1 || 100;
        //     const skip = (page - 1) * limit;
        //     query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numTours = await TourModel.countDocuments();
        //     if (skip >= numTours) throw new Error('This page does not exist');
        // }

        // execute Query

        
    //     const features = new APIFeature(Tour.find(), req.query)
    //     .filter()
    //     .sort()
    //     .limitField()
    //     .paginate();

    //     const allTours = await features.query;

        

    
    // res.status(200).json({ status : 'success', results: allTours.length ,data : { tour: allTours}
      // requestedAt : req.requestTime,
      // results : tours.length,
      // data : {tours}
//     });
   
// });

exports.getTour = factoryControl.getOne(Tour , { path : 'reviews'});  // ,select can use 
  //  const findTour = tours.find(el => el.id === id);
//
  //  res.status(200).json({ status : 'success',
  //  data : findTour});
    

exports.createTour = factoryControl.createOne(Tour);

exports.patchTour = factoryControl.updateOne(Tour);

exports.deleteTour = factoryControl.deleteOne(Tour);

// /tours-within/:distance/center/:latlng/unit/:unit'
// /tours-distance?distance=223&center=-40,45&unit=mi
// /tours-distance/233/center/34.115151,-118.133648/unit/mi


exports.getToursWithin = catchAsync(async (req, res ,next) => {
    const { distance, latlng , unit } = req.params;
    const [lat, lng ] = latlng.split(',');   
    
    const radius = unit === 'mi' ? distance / 3953.2 : distance / 6378.1; 

    if (!lat || !lng) new AppError('Please provide a lat and lng in the format', 400);

    const tours = await Tour.find({ 
        
        startLocation: { $geoWithin : { $centerSphere: [[lng, lat], radius]}}});

    console.log(distance, lat, lng , unit); 

    res.status(200).json({ status: 'OK',results: tours.length,  data: {
        data : { data : tours}
    }

});

});


exports.getDistances = catchAsync(async (req, res , next) => {

    const { latlng , unit } = req.params;
    const [lat, lng ] = latlng.split(',');   


    const multiplier = unit === 'mi'? 0.000621371 : 0.001;
    

    if (!lat || !lng) new AppError('Please provide a lat and lng in the format', 400);

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1 
            }
        }
    ]);

    res.status(200).json({ status: 'OK', data: {
        data : { data : distances}
    }

});

    


});



   // const newTours = new TourModel({});
   // newTours.save()

// try {

//     const newTours = await TourModel.create(req.body);

//     res.status(200).json({ status : 'success', data : {tour : newTours}});

// } catch (err) {

//     res.status(400).json({ status : 'fail', message : err.message });



// };});




  // const body = req.body;
  // const newid = tours[tours.length-1].id +1;

  // const newtour = Object.assign({id : newid }, body);

  // tours.push(newtour);

  // fs.writeFile(`${__dirname}/dev-data/data/tour-simple.json`, JSON.stringify(tours),(err) =>{
  //     if (!err) res.status(201).json({ status : 'success', data : {tours : newtour}});
  // });



// exports.deleteTour = async (req, res) => {
    

//     try {

//         await Tour.findByIdAndDelete(req.params.id);
//         res.status(204).json({ 
//             status: 'success', 
//             data: null
//         });
//         }catch (err) {
//             res.status(400).json({ status : 'fail', message : 'Invalid name Input' });
//         }

// };