const reviewModel = require('../models/reviewModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const userModel = require('../models/usersModel');
const mongoose = require('mongoose');

const recalculateProductAvgRating = async (productId) => {
    const result = await reviewModel.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = result.length ? Number(result[0].avgRating.toFixed(2)) : 0;
    await productModel.updateOne({ _id: productId }, { avgRating: avgRating });

    return avgRating;
};

const canReview = async (buyerId, productId) => {
    const user = await userModel.findById(buyerId);

    if (!user || user.type !== 'buyerAccount') {
        return { ok:false, status:403, message:'buyer account only' };
    }

    const order = await orderModel.findOne({
        buyerId: buyerId,
        status: 'Delivered',
        'itemsList.productId': productId
    });

    if (!order) {
        return { ok:false, status:403, message:'you can only review delivered products' };
    }

    return { ok:true };
};

exports.addComment = async (req, res) => {
    try {
        const productId = req.body.productId;
        const rating = req.body.rating;
        const commentText = req.body.commentText;

        if (!productId || !rating) {
            return res.status(400).json({ success:false, message:'product and rating are required' });
        }

        const permission = await canReview(req.userInfo.userId, productId);

        if (!permission.ok) {
            return res.status(permission.status).json({ success:false, message:permission.message });
        }

        const review = await reviewModel.findOneAndUpdate(
            { productId: productId, buyerId: req.userInfo.userId },
            { rating: rating, commentText: commentText },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        const productAvgRating = await recalculateProductAvgRating(productId);
        res.status(201).json({ success:true, message:'review saved', review: review, productAvgRating: productAvgRating });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.updateComment = exports.addComment;

exports.removeComment = async (req, res) => {
    try {
        const review = await reviewModel.findOneAndDelete({
            _id: req.params.id,
            buyerId: req.userInfo.userId
        });

        if (!review) {
            return res.status(404).json({ success:false, message:'review not found' });
        }

        await recalculateProductAvgRating(review.productId);
        res.json({ success:true, message:'review deleted' });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.getComment = async (req, res) => {
    try {
        const review = await reviewModel.findById(req.params.id);
        res.json({ success:true, result: review });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.getReviewsByProductId = async (req, res) => {
    try {
        const reviews = await reviewModel.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.json({ success:true, result: reviews });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find({ buyerId: req.userInfo.userId }).sort({ createdAt: -1 });
        res.json({ success:true, result: reviews });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.getReviewSummary = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.productId);
        const reviews = await reviewModel.find({ productId: req.params.productId });

        if (!product) {
            return res.status(404).json({ success:false, message:'product not found' });
        }

        if (reviews.length === 0) {
            return res.json({
                success:true,
                result:{
                    productId: req.params.productId,
                    productName: product.name,
                    reviewCount: 0,
                    averageRating: 0,
                    summary: 'No reviews yet.'
                }
            });
        }

        const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        const goodReviews = reviews.filter((review) => review.rating >= 4).length;
        const badReviews = reviews.filter((review) => review.rating <= 2).length;
        const summary = `${reviews.length} buyers reviewed this product. Average rating is ${average.toFixed(1)} out of 5. ${goodReviews} reviews are positive and ${badReviews} reviews are low.`;

        res.json({
            success:true,
            result:{
                productId: req.params.productId,
                productName: product.name,
                reviewCount: reviews.length,
                averageRating: Number(average.toFixed(2)),
                summary: summary
            }
        });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.rateProduct = exports.addComment;
