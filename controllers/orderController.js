const jwt = require("jsonwebtoken")
const {signupSchema} = require('../middlewares/validator');
const {doHash,doPassValidation} = require("../utils/hashing");

const orderModel = require('../models/orderModel');
const userModel = require('../models/usersModel');
const productModel = require("../models/productModel");


/*
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
*/ 

exports.addOrder = async (req, res) => {
    try {
        const existingUser = await userModel.findById(req.userInfo.userId);
        if (!existingUser || existingUser.type !== "buyerAccount") {
            return res.status(403).json({ success: false, message: "you must be a buyer" });
        }

        const { itemList, shippingAddress } = req.body;
        let totalPrice = 0;

        for (const item of itemList) {
            const product = await productModel.findById(item.productId);

            if (!product) {
                return res.status(404).json({ success: false, message: `product ${item.productId} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `${product.name} is out of stock` });
            }

            totalPrice += (product.price * item.quantity);
        }

        for (const item of itemList) {
            await productModel.updateOne(
                { _id: item.productId },
                { $inc: { stock: -item.quantity } }
            );
        }

        const newOrder = await orderModel.create({
            buyerId: req.userInfo.userId,
            itemsList: itemList,
            totalPrice: totalPrice,
            shippingAddress: shippingAddress
        });

        res.status(201).json({ success: true, message: "Order added", order: newOrder });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeOrder = async(req, res)=>{
    try {
        const existingUser = await userModel.findById(req.userInfo.userId);
        if (!existingUser || existingUser.type !== "buyerAccount") {
            return res.status(403).json({ success:false, message: "you must be a buyer" });
        }
        const order_id = req.params.id;
        const order = await orderModel.findById(order_id);

        if (!order.buyerId.equals(req.userInfo.userId)) {
            return res.status(403).json({ success:false, message: "you are not the owner of this order" });
        }
        
        for (const item of order.itemsList) {
            await productModel.updateOne(
                { _id: item.productId },
                { $inc: { stock: item.quantity } }
            );
        }
        await orderModel.deleteOne({_id:order_id});
            return res.status(201).json({ success:true, message: "order is deleted " });
    }catch(err){
        res.status(500).json({ success: false, message: error.message })
        }
}

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemList, shippingAddress } = req.body;
        const userId = req.userInfo.userId;

        const oldOrder = await orderModel.findById(id);
        if (!oldOrder) {
            return res.status(404).json({ success: false, message: "order not found" });
        }
        if (!oldOrder.buyerId.equals(userId)) {
            return res.status(403).json({ success: false, message: "unauthorized  " });
        }

        if (oldOrder.status !== 'Pending') {
            return res.status(400).json({ success: false, message: "cannot update an order that is already processed" });
        }

        if (shippingAddress) {
            oldOrder.shippingAddress = shippingAddress;
        }

        if (itemList) {
            let newTotalPrice = 0;
            for (const item of oldOrder.itemsList) {
                await productModel.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: item.quantity } }
                );
            }

            for (const item of itemList) {

                const product = await productModel.findById(item.productId);
                if (!product) {
                    return res.status(404).json({ success: false, message: `product ${item.productId} not found` });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({ success: false, message: `insufficient stock for ${product.name}` });
                }
                
                newTotalPrice+=(product.price * item.quantity);
            }


            for (const item of itemList) {
                await productModel.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: -item.quantity } }
                );
            }

            oldOrder.itemsList = itemList;
            oldOrder.totalPrice = newTotalPrice;
        }


        const updatedOrder = await oldOrder.save();
        res.status(200).json({ success: true, message: " Order updated successfully", order: updatedOrder });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getOrder = async(req, res)=>{

    try{
        const existingUser = await userModel.findById(req.userInfo.userId);
        if (!existingUser || existingUser.type !== "buyerAccount") {
            return res.status(403).json({ success:false, message: "you must be a buyer" });
        }
        const order_id = req.params.id;
        const order = await orderModel.findById(order_id);

        if (!order.buyerId.equals(req.userInfo.userId)) {
            return res.status(403).json({ success:false, message: "you are not the owner of this order" });
        }

        return res.status(200).json({ success:true, result:order });

    }catch(err){
        res.status(500).json({ success: false, message: error.message })
    }
}

exports.traceOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.userInfo.userId;

        const order = await orderModel.findById(orderId).populate('itemsList.productId', 'name price deliveryTimeEstimate');


            if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!order.buyerId.equals(userId)) {
            return res.status(403).json({ success: false, message: "Unauthorized to trace this order" });
        }


        res.status(200).json({

            success: true,
            status: order.status, 
            details: {
                items: order.itemsList,
                totalPrice: order.totalPrice,
                shippingAddress: order.shippingAddress,
                placedAt: order.createdAt,
                lastUpdate: order.updatedAt
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getBuyerOrders = async(req, res)=>{
    try{
    const existingUser = await userModel.findById(req.userInfo.userId);
        if (!existingUser || existingUser.type !== "buyerAccount") {
            return res.status(403).json({ success:false, message: "you must be a buyer" });
        }
         const buyerId = req.userInfo.userId;
        const result = await orderModel.find({ buyerId })
        res.status(200).json({ success: true, result:result })

    }catch(err){
        res.status(500).json({ success: false, message: err.message })
    }
}


exports.getSellerOrdersBasedonStatus = async(req, res)=>{

    try{
    const existingUser = await userModel.findById(req.userInfo.userId);
        if (!existingUser || existingUser.type !== "buyerAccount") {
            return res.status(403).json({ success:false, message: "you must be a buyer" });
        }

        const status= req.params.status;
        const buyerId = req.userInfo.userId;
        const result = await orderModel.find({ buyerId,status });
        

        res.status(200).json({ success: true, result:result })

    }catch(err){
        res.status(500).json({ success: false, message: err.message })
    }
}
