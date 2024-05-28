const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../models/userModel');

const catchAsync = require('./../utilis/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utilis/appError');
const bcrypt = require('bcryptjs');
const Email = require('./../utilis/email');
// const sendEmail = require('./../utilis/email');
const { path } = require('../app');
// const dotenv = require('dotenv');

// dotenv.config({ path: './../config.env'});

const signToken = ( userID ) => {
    return  jwt.sign({id : userID} , process.env.JWT_SECRETKEY, { expiresIn: process.env.JWT_EXPIRES_IN});
};


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Calculate the expiration time for the cookie
    const expirationTime = new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600000);

    // Define cookie options
    const cookieOptions = {
        maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600000, // Convert days to milliseconds
        secure: false, // Set to true if served over HTTPS
        httpOnly: true,
        domain: '127.0.0.1', // Set to your domain without the protocol
        sameSite: 'strict',
        path: '/',
    };
    
    

    // // Log token and cookie options for debugging
    // console.log('Token:', token);
    // console.log('Cookie Options:', cookieOptions);

    // // Set the JWT cookie in the response
    res.cookie('jwt', token, cookieOptions);

    // Remove sensitive information from user object
    user.password = undefined;

    res.status(201).json({ status: 'success', token, data: { user : user.role }})



    // Send response with status, token, and user data
    // res.status(statusCode).json({
    //     status: 'success',
    //     token,
    //     data: {
    //         user
    //     }
    // });

};


exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role

    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);

    await new Email(newUser, url).sendWelcome();

    // const token = jwt.sign({id: newUser._id }, process.env.JWT_SECRETKEY, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // });
    createSendToken(newUser, 201, res);
});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
    return next( new AppError('Please provide a valid email and password', 400));}
    
    const user = await User.findOne({ email : email }).select('+password');
    // if(!user || !(await bcrypt.compare(password, user.password))) {
    console.log(user);
    
    if (!user) {


    return  next( new AppError(`1.Can not found the user please check your email & password incorrected` , 404));
    }

    const correct = await user.correctPassword(password, user.password);

    if (!correct) {

        return next( new AppError(`2.Can not found the user please check your email & password incorrected`, 404));
    }

    
    

    createSendToken(user, 201, res);

    return

    
});

exports.logout = (req, res) => {
    // Set the JWT cookie to expire immediately

    res.cookie('jwt', '', {
        maxAge: 0,
        httpOnly: true
    });

    res.status(200).json({ status:'success' });

};



exports.protect = catchAsync(async(req, res, next) => {
    // 1) get token and check if it's there
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        
    } else if (req.cookies.jwt){
        token = req.cookies.jwt
    }

    console.log(token); // Log the extracted token

    if(!token) {
        return next(new AppError('You are not log in', 401));
    }

    // 2) verification token  decode will give id , iat , 
    const decode =  await promisify(jwt.verify)(token, process.env.JWT_SECRETKEY);
    console.log(decode);

    
    // 3) check if user still exists

    const freshUser = await User.findById(decode.id);
    if(!freshUser) {
        return next(new AppError('The user no longer Exits' , 401));
    };

    // 4) check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decode.iat)) {
        return next(new AppError('user recently changed password! Please log in again', 401));
    }
    // Grant Access to Protected route
    
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
});

exports.isLoggedIn = async (req, res, next) => {

    if (req.cookies.jwt) {

        try {

            const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETKEY);

            const freshUser = await User.findById(decode.id);
            
            if (!freshUser || freshUser.changedPasswordAfter(decode.iat)) {
                return next();
            }
            
            res.locals.user = freshUser; // Set the user in res.locals for access in templates
            // Handle any errors from jwt.verify or User.findById
            return next();
        } catch (err){
            return next();

        }
    }

        next();
};
    



exports.restricTo = (...roles) => {

    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if(!roles.includes(req.user.role)){

            return next(new AppError('You dont have Permission', 403));

        }

        next();
    };

};

exports.forgotPassword = catchAsync(async(req, res, next) => {

    // 1) Get on post email

    const user = await User.findOne( { email: req.body.email});

    if(!user) {
    
    return next( new AppError('There is no user with email address', 404));
    };


    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave : false });

        
    
    try {

        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user , resetURL).sendPasswordReset();

    res.status(200).json({
        statusbar: 'success',
        message: 'Token sent to email'
    });

    } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave : false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));

}


});

exports.resetPassword = catchAsync(async (req, res, next) => {

    //1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ 
        passwordResetToken : hashedToken, 
        passwordResetExpires: { $gt: Date.now()} });

     // 2) If token has not expired, and there is user , set the new password

    if (!user) return next(new AppError('Timeout token, Token could not be found',400));

    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();


    // if (Date.now() - user.passwordResetExpires < 0) new AppError('Your token was Expired',404)

    
    // 3) Update changePasswordAt property for user

    //4) Log the user in ,sent JWT
    createSendToken(user._id , 200, res);

});


exports.updatePassword = catchAsync(async (req, res, next) => {

        // const email = req.body.email;
        // const passwordCurrent = req.body.passwordCurrent;
        // const password = req.body.password;
        // const passwordConfirmation = req.body.passwordConfirmation;

        const { password , passwordCurrent, passwordConfirmation } = req.body;



    // 1) Get user from collection
        const user = await User.findById(req.user._id).select('+password');
        const correctPassword = await user.correctPassword(passwordCurrent, user.password);

    // 2) Check if Posted current password is correct
    if (!user.password || !correctPassword) return  next( new AppError('Wrong Password or Email', 404));


    //3) If so , update password

    user.password = password;
    user.passwordConfirmation = passwordConfirmation;
    await user.save();

    // User.findByIdAndUpdate will not trigger validation so that everthing that relate to password shouldn't use this
    // that why we choose findById instead so it can trigger pre ('save') middleware and can be used validation

    // 4) Log user in , send JWT

    createSendToken(user._id, 200 , res);

});
