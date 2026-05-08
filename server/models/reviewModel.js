const { Timestamp } = require('bson');
const { bool } = require('joi');
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    buyerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating:{
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    isFlagged:{
        type:Boolean,
        default:false
    },
    commentText: String
}, { timestamps: true });


module.exports = mongoose.model('Review', reviewSchema);
