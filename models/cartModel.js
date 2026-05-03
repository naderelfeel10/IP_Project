
const { Timestamp } = require('bson');
const { bool } = require('joi');
const mongoose = require('mongoose')


const cartSchema = new mongoose.Schema({

    buyerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    itemsList: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity:{
            type:Number,
            default:1
        }
        }],
    totalPrice: {
        type: Number,
         required: true
        },

}, { timestamps: true });


const Order = mongoose.model('Cart', cartSchema);