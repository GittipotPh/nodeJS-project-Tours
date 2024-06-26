const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');


const tourSchema = new mongoose.Schema({
    name : {
        type : String,
        required: [true, 'A tour must have a name'],
        unique : true,
        trim : true,
        maxlength : [40, 'A tour must have less than 40 characters'],
        minLength : [10, 'A tour must have at least 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain charactor']
    },
    
    slug : String,

    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },

    maxGroupSize:{
        type: Number,
        required: [true, 'A tour must have a max group size'],
    },

    difficulty:{
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: ['easy','medium','difficult'],
        message: 'Difficulty  is either: easy, medium, difficult'
    },

    ratingsAverage: {
        type:Number,
        default: 4.5,
        min: [1, 'Ratings must be above 1'],
        max: [5 , 'Ratings must have max 5'],
        set: val => Math.round(val *10) / 10 // 4.666 , 46.66 , 47 , 4.7
    },

    ratingsQuantity: {
        type:Number,
        default: 0
    },
    price: {
        type : Number,
        required: [true, 'A tour must have a price']
    },

    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
            return val < this.price;
        },
        message: 'Price must ({VALUE}) higher than discount value'
    }
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },

    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },


    startDates: [Date],

    secretTour: {
        type: Boolean,
        default: false
    },

    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },

    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
        }
    ]

    // reviews: [
    //     {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review'
    //     }
    // ]

}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

// tourSchema.index({price: 1})
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({ slug: 1});
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// Virtual Populates
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});


tourSchema.pre('save',function(next) {
    this.slug = slugify(this.name, { lower:true});
    next();

});

// Embedding
// tourSchema.pre('save', async function(next){
//     const guidePromises = this.guides.map(async id => await User.findById(id)); 
//     this.guides = await Promise.all(guidePromises);
//     next();
// });

// tourSchema.pre('save',function(next) {
//     console.log('Will save document....')
//     next();

// });
// tourSchema.post('save',function(doc, next) {
//     console.log(doc);
//     next();

// });


// Query middleware

tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: {$ne: true}});

    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({ 
        path: 'guides',
        select: '-__v -passwordChangedAt'

    });

    next();
})

tourSchema.post(/^find/, function(docs, next) {
    // console.log(docs);
    console.log(`Query take : ${Date.now() - this.start} millisecond`);
    next();
});


// tourSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({ $match: { secretTour: {$ne: true}}});
//     // console.log(this.pipeline());

//     next();

// })



const Tour = mongoose.model('Tour', tourSchema); 

module.exports = Tour;