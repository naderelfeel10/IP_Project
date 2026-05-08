const jwt = require("jsonwebtoken")
const {signupSchema} = require('../middlewares/validator');
const {doHash,doPassValidation} = require("../utils/hashing");

const orderModel = require('../models/orderModel');
const userModel = require('../models/usersModel');
const productModel = require("../models/productModel");
const flagModel = require("../models/flagModel");
const cartModel = require("../models/cartModel");


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

        const { itemList, shippingAddress, buyerComment, stockAlreadyReserved = false } = req.body;
        let totalPrice = 0;
        let reservedCart = null;

        if (stockAlreadyReserved) {
            reservedCart = await cartModel.findOne({ buyerId: req.userInfo.userId });
            if (!reservedCart) {
                return res.status(400).json({ success: false, message: "cart not found" });
            }

            for (const item of itemList) {
                const reservedItem = reservedCart.itemsList.find((cartItem) => (
                    cartItem.productId.equals(item.productId) && cartItem.quantity >= item.quantity
                ));

                if (!reservedItem) {
                    return res.status(400).json({ success: false, message: "order items must match reserved cart items" });
                }
            }
        }

        for (const item of itemList) {
            const product = await productModel.findById(item.productId);

            if (!product) {
                return res.status(404).json({ success: false, message: `product ${item.productId} not found` });
            }

            if (!stockAlreadyReserved && product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `${product.name} is out of stock` });
            }

            totalPrice += (product.price * item.quantity);
        }

        if (!stockAlreadyReserved) {
            for (const item of itemList) {
                await productModel.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: -item.quantity } }
                );
            }
        }

        const newOrder = await orderModel.create({
            buyerId: req.userInfo.userId,
            itemsList: itemList,
            totalPrice: totalPrice,
            shippingAddress: shippingAddress,
            buyerComment: buyerComment
        });

        if (stockAlreadyReserved) {
            await cartModel.deleteOne({ buyerId: req.userInfo.userId });
        }

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
        const { itemList, shippingAddress, buyerComment } = req.body;
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

        if (buyerComment !== undefined) {
            oldOrder.buyerComment = buyerComment;
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
                buyerComment: order.buyerComment,
                placedAt: order.createdAt,
                lastUpdate: order.updatedAt
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const nextOrderStatus = {
    Pending: 'Shipped',
    Shipped: 'Delivered'
};

exports.progressOrderStatus = async (req, res) => {
    try {
        const existingUser = await userModel.findById(req.userInfo.userId);
        if (!existingUser || existingUser.type !== "buyerAccount") {
            return res.status(403).json({ success: false, message: "you must be a buyer" });
        }

        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "order not found" });
        }

        if (!order.buyerId.equals(req.userInfo.userId)) {
            return res.status(403).json({ success: false, message: "you are not the owner of this order" });
        }

        const nextStatus = nextOrderStatus[order.status];
        if (!nextStatus) {
            return res.status(400).json({
                success: false,
                message: `order cannot progress from ${order.status}`
            });
        }

        order.status = nextStatus;
        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            message: `Order status progressed to ${nextStatus}`,
            result: updatedOrder
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getOrdersForBuyer = async (buyerId) => {
    return orderModel
        .find({ buyerId })
        .populate('itemsList.productId', 'name price deliveryTimeEstimate sellerId')
        .sort({ createdAt: -1 });
};

exports.reportIssue = async(req, res)=>{
    try{
        const existingUser = await userModel.findById(req.userInfo.userId);
        if (!existingUser || existingUser.type !== "buyerAccount") {
            return res.status(403).json({ success:false, message: "you must be a buyer" });
        }

        const { issueScope, issueDescription, productId } = req.body;

        if(!['Order', 'Product', 'Seller'].includes(issueScope)){
            return res.status(400).json({ success:false, message: "issueScope must be Order, Product, or Seller" });
        }

        if(!issueDescription || !issueDescription.trim()){
            return res.status(400).json({ success:false, message: "issueDescription is required" });
        }

        const order = await orderModel
            .findById(req.params.id)
            .populate('itemsList.productId', 'sellerId');

        if(!order){
            return res.status(404).json({ success:false, message: "order not found" });
        }

        if(!order.buyerId.equals(req.userInfo.userId)){
            return res.status(403).json({ success:false, message: "you are not the owner of this order" });
        }

        let reportProductId;
        let sellerId;

        if(issueScope === 'Product' || issueScope === 'Seller'){
            const orderItem = order.itemsList.find((item) => {
                const itemProductId = item.productId?._id || item.productId;
                return itemProductId?.toString() === productId;
            });

            if(!orderItem){
                return res.status(400).json({ success:false, message: "selected product is not in this order" });
            }

            reportProductId = orderItem.productId._id || orderItem.productId;
            sellerId = orderItem.productId.sellerId;
        }

        const flag = await flagModel.create({
            userId: req.userInfo.userId,
            orderId: order._id,
            productId: reportProductId,
            sellerId,
            issueScope,
            issueDescription: issueDescription.trim()
        });

        return res.status(201).json({ success:true, message: "issue reported", result: flag });
    }catch(err){
        res.status(500).json({ success: false, message: err.message })
    }
}

exports.getBuyerOrders = async(req, res)=>{
    try{
    const existingUser = await userModel.findById(req.userInfo.userId);
        if (!existingUser || existingUser.type !== "buyerAccount") {
            return res.status(403).json({ success:false, message: "you must be a buyer" });
        }
         const buyerId = req.userInfo.userId;
        const result = await getOrdersForBuyer(buyerId);
        res.status(200).json({ success: true, result:result })

    }catch(err){
        res.status(500).json({ success: false, message: err.message })
    }
}

exports.getAllOrders = exports.getBuyerOrders;


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
