const { Timestamp } = require('bson');
const { bool } = require('joi');
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    orderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
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


const Order = mongoose.model('Review', reviewSchema);