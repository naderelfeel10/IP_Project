const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    issueScope: {
        type: String,
        enum: ['Order', 'Product', 'Seller']
    },
    issueDescription: {
        type: String
    },
    status: {
        type: String,
        enum: ['Open', 'Resolved'],
        default: 'Open'
    },
    reason: {
        type: String
    },
    details: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Flag', flagSchema);
