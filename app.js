const path = require('path');
const express = require('express'); //JSON Router
const morgan = require('morgan'); //logger
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); 
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const session = require('express-session');


const AppError = require('./utilis/appError'); 
const globalErrorControl = require('./controllers/errorController');


const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');



const app = express();




app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//1) Global Middleware

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));

app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(`${__dirname}/public`));

// Set security  HTTP headers

app.use(helmet({ contentSecurityPolicy: false }))

console.log(process.env.NODE_ENV);

// Development logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));  // logger
}

// Limit requests from same API endpoint
const limiter = rateLimit({ 
    max: 100,
    windowMs: 60 * 60 * 1000,   // 100 request per IP in 1 hour --> 1000(milli) * 60(sec) = 1 minute
    message: 'Too many request from this IP, please try again in an hour'

});

app.use('/api',limiter); // covering all route start with /api




// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb'}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));

app.use(cookieParser()); 
// app.use(session({secret : 'secret', resave: false, saveUnitinialied: false}));

//Data sanitization againts Nosql query injection ex. receiving $lt : query change to non$lt
app.use(mongoSanitize());

//Data sanitization againts XSS(cross site scripting attack) ex.HTML // JS code
app.use(xss());


// Prevent parameter pollution
app.use(hpp( {
    whitelist: [ 'duration', 'ratingsQuantity', 'ratingsAverage', 'ratingQuantity', 'ratingAverage', 'maxGroupSize',
    'price', 'difficulty']
}));

// Serving Static files


// app.use((req, res, next) => {
// console.log("Hello from middleware");
// next();
// });

// Test Middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log('this is cookie',req.cookies);

next();
});

//3) routes


app.use('/',viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({ status: 'fail', message: `Can't find ${req.originalUrl} on the server`});
    // const err = new Error(`Can't find ${req.originalUrl} on the server`);
    // err.status = 'fail';
    // err.statusCode = 404;
    // next(err)

    next(new AppError(`Can't find ${req.originalUrl} on the server`));
    

    
});

app.use(globalErrorControl);




module.exports = app;