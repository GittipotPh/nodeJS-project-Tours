const AppError = require('./../utilis/appError');



const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400);};

const handleDuplicateErrorDB = err => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate value : ${value} Please use another name`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {

    const errors = Object.values(err.errors).map(el => el.message)

    

    const messages = `Invalid input Data ${errors.join(', ')}.`


    return new AppError(messages, 400);
}

const handleJsonWebTokenErrorDB = () => new AppError('JSON Web Token Invalid. Please log in again',401);
const handleTokenExpiredErrorDB = () => new AppError('jwt expired, Please log in again 🙌🙌',401);



const sendErrorDev = (err, req ,res) => {
    // API
    if(req.originalUrl.startsWith('/api')) {
    
    return res.status(err.statusCode).json({ status: err.status ,error: err ,message: err.message, stack: err.stack });

    }

    // RENDER WEBSITE
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
    });
    }


const sendErrorProd = (err , req, res) => {
    // Operational trust // we created error by ourselves

    // API
    if(req.originalUrl.startsWith('/api')) {
        console.log(req.originalUrl);

    // trusted error : send message to client
        
    if (err.isOperational) {
        console.log('hereeeeeeeeeeeeeeeeeeeeeeeeee');
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
            });
    };

    console.error('ERROR', err);

    res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: 'Please try again later'

        });
    }

    // Handle Render website
    if (err.isOperational){
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message

        });

    }

    console.error('ERROR', err);

    res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: 'Please try again later'

        });
};



module.exports = ((err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';


    
    if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, req, res); 
    } else if (process.env.NODE_ENV == 'production') {
        let error = { ...err};
        error.message = err.message;

        if(error.name == 'CastError') error = handleCastErrorDB(error);

        if(error.code == '11000') error = handleDuplicateErrorDB(error);

        if(error.name == 'ValidationError') error = handleValidationErrorDB(error);

        if(error.name == 'JsonWebTokenError') error = handleJsonWebTokenErrorDB(error);

        if(error.name == 'TokenExpiredError') error = handleTokenExpiredErrorDB(error);

        
        // console.log(err.message);
        // console.log(error.message);

    sendErrorProd(error, req, res);  
    } 
});
