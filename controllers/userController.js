const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utilis/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utilis/catchAsync');
const factoryControl = require('../controllers/handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb ) => {
//         cb(null, 'public/img/users' );
//     },
//     filename: (req, file, cb ) => {

//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);

//     }
// });

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
    .resize(100, 100)
    .toFormat('jpeg')
    .jpeg({quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...allowedFileds) => {
    const newObj = {};
    console.log('Here is Object',Object.keys(obj));
    Object.keys(obj).forEach(el => {
        console.log('each', el);
        console.log('allow', allowedFileds);
        console.log('check', newObj[el]);
        console.log(obj);
        console.log('check', obj[el]);
        if(allowedFileds.includes(el)) newObj[el] = obj[el];
        console.log('pair', newObj[el], obj[el]);
        console.log('----------',newObj);
    })

    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.getAllUsers = factoryControl.getAll(User);



exports.updateMe = catchAsync(async (req, res, next) => {
    console.log(req.file);
    console.log(req.body);

    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirmation) {
        return next( new AppError('This route is not for password updates. Please use /updateMyPassword'),400);
    };

    //2 Update user doc
    // const user = await User.findById(req.user.id);
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo = req.file.filename;
    console.log(req.file);
    console.log(filteredBody);
    // use filter protect changing roles for admin

    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody
        , { new: true, runValidators: true});
    // await user.save({ validateBeforeSave : false});
    

    res.status(200).json({ status : 'success' , data: { user: updateUser}});


});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false})

    res.status(204).json({
        stasus: 'success',
        data: null

    })
})

exports.getUser = factoryControl.getOne(User);

exports.createUser = (req, res) => {
    res.status(500).json({
        status : 'error', 
        message : 'This route is not yet defined Please user /signup instead'});
};

// Do not update passwords with this
exports.deleteUser = factoryControl.deleteOne(User);

exports.updateUser = factoryControl.updateOne(User);
