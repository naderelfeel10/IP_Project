const jwt = require("jsonwebtoken")
const {signupSchema} = require('../middlewares/validator');
const {doHash,doPassValidation} = require("../utils/hashing");

const cartModel = require('../models/cartModel');
const userModel = require("../models/usersModel");
const productModel = require("../models/productModel");


exports.createCart = async(req, res)=>{

    const buyer_id = req.userInfo.userId;

    const existingUser = await userModel.findById(req.userInfo.userId);

    if (!existingUser || existingUser.type !== "buyerAccount") {
        return res.status(403).json({ success: false, message: "you must be a buyer" });
    }
    
    const {itemsList} = req.body;
    var totalPrice=0;

    for (const item of itemsList) {
        const product = await productModel.findById(item.productId);

        if (!product) {
            return res.status(404).json({ success: false, message: `product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
            return res.status(400).json({ success: false, message: `insufficient stock for ${product.name}` });
        }
    
        totalPrice+=(product.price * item.quantity);
    }

    await cartModel.create({buyerId:buyer_id, itemsList:itemsList, totalPrice:totalPrice});

    return res.status(201).json({ success:true, result:{buyerId:buyer_id, itemsList:itemsList, totalPrice:totalPrice}  });
    
}

exports.clearCart = async(req, res)=>{
    const buyer_id = req.userInfo.userId;
    const cartId = req.params.id
    const existingUser = await userModel.findById(req.userInfo.userId);

    if (!existingUser || existingUser.type !== "buyerAccount") {
        return res.status(403).json({ success: false, message: "you must be a buyer" });
    }
    await cartModel.updateOne({_id:cartId}, {$set: {itemsList:[],totalPrice:0}})
    return res.status(201).json({ success:true, message:"cart cleared"});
}

exports.getCart = async(req, res)=>{

    try{
    const buyer_id = req.userInfo.userId;
    const existingUser = await userModel.findById(req.userInfo.userId);

    if (!existingUser || existingUser.type !== "buyerAccount") {
        return res.status(403).json({ success: false, message: "you must be a buyer" });
    }

    const cart = await cartModel.find({buyerId:buyer_id});

    return res.status(200).json({ success:true, result:cart});

    }catch(err){
        return res.status(500).json({ success:false, message:err.message});

    }
}

