const jwt = require("jsonwebtoken")
const {signupSchema} = require('../middlewares/validator');
const {doHash,doPassValidation} = require("../utils/hashing");

const reviewModel = require('../models/reviewModel');
const orderModel = require('../models/orderModel');
const userModel = require('../models/usersModel');
const productModel = require("../models/productModel");

exports.addComment = async (req, res) => {

    try {
        const orderId = req.params.id
        const { rating, commentText } = req.body;
        const buyerId = req.userInfo.userId;

        const order = await orderModel.findById(orderId);
        if (!order || !order.buyerId.equals(buyerId)) {
            return res.status(403).json({ success: false, message: " unauthorized or order not found" });
        }

        /*
        if (order.status !== "Delivered") {
            return res.status(400).json({ success: false, message: "only delivered ordered can be reviewed" });
        */

        const existingReview = await reviewModel.findOne({ orderId, buyerId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "you  have reviewed this order" });
        }

        const newReview = await reviewModel.create({orderId,buyerId,rating,commentText});

        res.status(201).json({ success: true, message: "review added", review: newReview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



exports.removeComment = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.userInfo.userId;

        const review = await reviewModel.findById(reviewId);
        if (!review) return res.status(404).json({ success: false, message: "review was not found" });

        if (!review.buyerId.equals(userId)) {
            return res.status(403).json({ success: false, message: "unauthorized" });
        }

        await reviewModel.findByIdAndDelete(reviewId);
        res.status(200).json({ success: true, message: "review deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { rating, commentText } = req.body;

        const updatedReview = await reviewModel.findOneAndUpdate({_id: reviewId, buyerId: req.userInfo.userId },
            {$set: {rating, commentText, isFlagged: false}}, 
            {new: true}
        );

        if (!updatedReview) return res.status(404).json({ success: false, message :"review not found or unauthorized" });

        res.status(200).json({ success: true, review: updatedReview });


    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getComment = async (req, res) => {

    try {
        const reviewId = req.params.id;
        const review = await reviewModel.findById(reviewId);

        if (!review) return res.status(404).json({ success: false, message: "review not found" });
        res.status(200).json({ success: true, review });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


 