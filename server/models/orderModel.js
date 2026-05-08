const mongoose = require('mongoose');

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
    orderComment:{
        type:String
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled', 'Failed delivery'], 
        default: 'Pending' 
    },
    statusHistory:[{
        status:String,
        date:{
            type:Date,
            default:Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
