
const { Timestamp } = require('bson');
const { bool } = require('joi');
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    
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
    shippingAddress:{
        type:String
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);