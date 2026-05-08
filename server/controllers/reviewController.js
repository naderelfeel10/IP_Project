const { GoogleGenAI } = require('@google/genai');
const reviewModel = require('../models/reviewModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const userModel = require('../models/usersModel');
const mongoose = require('mongoose');

const recalculateProductAvgRating = async(productId)=>{
    const result = await reviewModel.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = result.length ? Number(result[0].avgRating.toFixed(2)) : 0;
    await productModel.updateOne({ _id: productId }, { $set: { avgRating } });

    return avgRating;
};

const ensureBuyerCanReviewProduct = async (buyerId, productId) => {
    const existingUser = await userModel.findById(buyerId);
    if(!existingUser || existingUser.type !== "buyerAccount"){
        return { allowed: false, status: 403, message: "you must be a buyer" };
    }

    const product = await productModel.findById(productId);
    if(!product){
        return { allowed: false, status: 404, message: "product not found" };
    }

    const deliveredOrder = await orderModel.findOne({
        buyerId,
        status: 'Delivered',
        'itemsList.productId': productId
    });

    if(!deliveredOrder){
        return {
            allowed: false,
            status: 403,
            message: "you can only review products from delivered orders"
        };
    }

    return { allowed: true };
};

exports.addComment = async(req, res)=>{
    try{
        const { productId, rating, commentText } = req.body;
        const buyerId = req.userInfo?.userId;

        if(!productId || !rating){
            return res.status(400).json({success:false, message:"productId and rating are required"});
        }

        if(rating < 1 || rating > 5){
            return res.status(400).json({success:false, message:"rating should be between 1 and 5"});
        }

        const permission = await ensureBuyerCanReviewProduct(buyerId, productId);
        if(!permission.allowed){
            return res.status(permission.status).json({success:false, message:permission.message});
        }

        const review = await reviewModel.findOneAndUpdate(
            { productId, buyerId },
            { rating, commentText },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        const productAvgRating = await recalculateProductAvgRating(review.productId);

        return res.status(201).json({success:true, message:"review added", review, productAvgRating});
    }catch(err){
        return res.status(500).json({success:false, message:err.message});
    }
};

exports.removeComment= (req, res)=>{

}

exports.updateComment = async(req, res)=>{
    try{
        const { productId, rating, commentText } = req.body;
        const buyerId = req.userInfo?.userId;

        if(!productId || !rating){
            return res.status(400).json({success:false, message:"productId and rating are required"});
        }

        if(rating < 1 || rating > 5){
            return res.status(400).json({success:false, message:"rating should be between 1 and 5"});
        }

        const permission = await ensureBuyerCanReviewProduct(buyerId, productId);
        if(!permission.allowed){
            return res.status(permission.status).json({success:false, message:permission.message});
        }

        const review = await reviewModel.findOneAndUpdate(
            { productId, buyerId },
            { rating, commentText },
            { new: true, runValidators: true }
        );

        if(!review){
            return res.status(404).json({success:false, message:"review not found"});
        }

        const productAvgRating = await recalculateProductAvgRating(review.productId);

        return res.status(200).json({success:true, message:"review updated", review, productAvgRating});
    }catch(err){
        return res.status(500).json({success:false, message:err.message});
    }
};


exports.getComment = (req, res)=>{

}

exports.getReviewsByProductId = async(req, res)=>{
    try{
        const productId = req.params.productId;
        const reviews = await reviewModel.find({productId}).sort({createdAt:-1});

        return res.status(200).json({success:true, result:reviews});
    }catch(err){
        return res.status(500).json({success:false, message:err.message});
    }
};

exports.getMyReviews = async(req, res)=>{
    try{
        const buyerId = req.userInfo?.userId;

        const existingUser = await userModel.findById(buyerId);
        if(!existingUser || existingUser.type !== "buyerAccount"){
            return res.status(403).json({success:false, message:"you must be a buyer"});
        }

        const reviews = await reviewModel.find({buyerId}).sort({createdAt:-1});

        return res.status(200).json({success:true, result:reviews});
    }catch(err){
        return res.status(500).json({success:false, message:err.message});
    }
};

exports.getReviewSummary = async(req, res)=>{
    try{
        const productId = req.params.productId;

        if(!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({success:false, message:"invalid product id"});
        }

        const product = await productModel.findById(productId);
        if(!product){
            return res.status(404).json({success:false, message:"product not found"});
        }

        const reviews = await reviewModel
            .find({productId})
            .select('rating commentText createdAt')
            .sort({createdAt:-1});

        if(reviews.length === 0){
            return res.status(200).json({
                success:true,
                result:{
                    productId,
                    productName: product.name,
                    reviewCount: 0,
                    summary: "No reviews yet."
                }
            });
        }

        const apiKey = "AIzaSyBpYIzHteMy7m44FyUNqD-qrxyq4twGG-E";
        if(!apiKey){
            return res.status(500).json({
                success:false,
                message:"GEMINI_API_KEY or GOOGLE_API_KEY is not configured"
            });
        }

        const ai = new GoogleGenAI({ apiKey });
        const reviewText = reviews.map((review, index) => (
            `${index + 1}. Rating: ${review.rating}/5. Comment: ${review.commentText || 'No comment provided.'}`
        )).join('\n');

        const response = await ai.models.generateContent({
            model:'gemini-3-flash-preview',
            contents: `response should be plain text one paragaraph summarization Summarize these customer reviews for "${product.name}" in 3 concise bullet points. Mention common positives, common complaints, and the overall sentiment. Do not invent details.\n\n${reviewText}`
        });

        return res.status(200).json({
            success:true,
            result:{
                productId,
                productName: product.name,
                reviewCount: reviews.length,
                averageRating: product.avgRating,
                summary: response.text || ''
            }
        });
    }catch(err){
        return res.status(500).json({success:false, message:err.message});
    }
};

exports.rateProduct = (req, res)=>{

}
 
