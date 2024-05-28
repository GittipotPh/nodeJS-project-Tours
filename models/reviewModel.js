// review /rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');


const ReviewSchema = new mongoose.Schema({

    review : {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating : {
        type: Number,
        min: 1,
        max: 5
    },
    createAt : {
        type: Date,
        default: Date.now()
    },

    tour : {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to the tour']
    },

    user : {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to the user']
    }
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});


// ReviewSchema.pre(/^find/, function(next){
//     this.populate('tour');
//     this.populate('user');
//     next();
// })

ReviewSchema.index({ tour: 1, user: 1}, { unique: true});

ReviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name'
    // });

    this.populate({
        path: 'user',
        select: 'name photo'
    });



    next();

    
});

ReviewSchema.statics.calcAverageRatings = async function(tourId) {

    const stats = await this.aggregate([
        {
            $match : { tour: tourId}
        },
        {
            $group : {
                _id: '$tour', // group by tour id
                nRating: { $sum: 1}, // count 1 per tour
                avgRating: { $avg: '$rating'}

            }
        }
    ]);

    // console.log('-----------------------------------------------------------------------------------------');
    // console.log(stats);

    if( stats.length > 0 ) {

   await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating

        });
    } else {
        Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5

    });
};
};
ReviewSchema.post('save', function(){
    //constructor point to current review
    // this point to current doc after post save
    // console.log('SEE tHISSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',this);
    // console.log('SEE tHISSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS ',this.tour);  //this.tour is ID of Model review
    // console.log('SEE THISSSSSSSSSSSSSSSSSSSSSSSS',this.constructor); // constructor is Review
   this.constructor.calcAverageRatings(this.tour); // Doc result can give access to the constructor
   console.log('----------------------------------------------------------------');
   

   
});

// findByIdAndUpdate
// findByIdAndDelete

ReviewSchema.pre(/^findOneAnd/, async function(req, res, next) {

    // console.log('Hereeeeeeeeeeeeee',this);  // this give all propoty of query now point to Review
    // console.log('RRRRRRRRRRRRRRRRRRRRRRRRR',this.keptProp)
    this.keptProp = await this.findOne(); // because doc of pre not like save // save give result // pre give query

    // console.log('RRRRRRRRRRRRRRRRRRRRRRRRR',this.keptProp); // this.keptProp will keep doc from query
});

    // console.log('----------------------------------------------------------------');
    // console.log('----------------------------------------------------------------');
    // console.log('----------------------------------------------------------------');

ReviewSchema.post(/^findOneAnd/, async function() {

    // because this.keptProp now under post that mean it now Doc result 
    // So that we need its constructor to use static fucntion calcAverageRating that is Review
    // console.log('Hereeeeeeeeeeeeee2222',this);
    // console.log('KEEPOUT', this.keptProp);
    // console.log('KEEPOUT2222', this.keptProp.constructor);
    this.keptProp.constructor.calcAverageRatings(this.keptProp.tour);
    // console.log('Hereeeeeeeeeeeeee3333',this);


});

const Review = new mongoose.model('Review', ReviewSchema);

module.exports = Review;