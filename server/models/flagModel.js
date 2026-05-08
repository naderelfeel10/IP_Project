const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    reason: {
        type: String,
        required: true
    },
    details: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Flag', flagSchema);
