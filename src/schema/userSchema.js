const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: /^\S+@\S+\.\S+$/,
        },
        name: {
            type: String,
            trim: true,
        },
        picture: {
            type: String,
            trim: true,
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        address:{
            city:String,
            street:String,
            number:Number,
            zipcode:String,
            geolocation:{
                lat:String,
                long:String
            }
        },
        phone:String
    },
    {
        timestamps: true,
    }
);

userSchema.index({ uid: 1, email: 1 }, { unique: true });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
