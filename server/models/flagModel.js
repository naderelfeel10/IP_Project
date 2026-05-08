const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    issueScope: {
        type: String,
        enum: ['Order', 'Product', 'Seller'],
        required: true
    },
    issueDescription: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Open', 'Resolved'],
        default: 'Open'
    }
}, { timestamps: true });

module.exports = mongoose.model('Flag', flagSchema);
