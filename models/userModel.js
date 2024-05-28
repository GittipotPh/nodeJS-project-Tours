const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const UserSchema = new mongoose.Schema({

    name : {
        type : String,
        required : [true , 'Please tell your name']

    },

    email : {
        type : String,
        required : [true, 'Please tell your email'],
        unique : true,
        lowercase: true,
        validate : [validator.isEmail, 'Please provide a valid email'],
    

    },

    photo : {type: String,
        default: 'default.jpg'},

    role: {

        type : String,
        enum : ['admin', 'guide', 'lead-guide', 'user'],
        default : 'user'

    },

    password : {
        type : String,
        required : [true, 'Please tell your password'],
        minLength : 8,
        select : false
    },

    passwordConfirmation : {
        type : String,
        required : [true, 'Please confirm your password'],
        validate : {
            // this only works on .create and save new documents
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }

    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    active: {
        type: Boolean,
        default: true,
        select : false
    }
    

});

UserSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000;

    next();
})

UserSchema.pre('save',async function(next){

    //Only run when password is modified
    if(!this.isModified('password')) return next();


    
    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirmation = undefined;

    next();

});

UserSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
};

UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {

    if(this.passwordChangedAt) {
        console.log(this.passwordChangedAt.getTime(), this.passwordChangedAt.toLocaleString(), (new Date(JWTTimestamp * 1000)).toLocaleString());
        const changeTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        console.log(changeTimeStamp);
        return JWTTimestamp < changeTimeStamp;
    }

    // False mean no change password
    return false;

};


UserSchema.methods.createPasswordResetToken =  function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log(resetToken);

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log( {resetToken}, this.passwordResetToken);
                                                        // 60 = 1 minute 
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log(this.passwordResetToken);
    console.log(this.passwordResetExpires);
    return resetToken

    
};

UserSchema.pre(/^find/, function(next) {
    // this points to current query User.find

    this.find({ active : { $ne : false}} );
    next();

});

const User = mongoose.model('User', UserSchema);

module.exports = User;