const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');

const getSellerProductIds = async (sellerId) => {
    const products = await productModel.find({ sellerId: sellerId }).select('_id');
    return products.map((product) => product._id);
};

exports.addOrder = async (req, res) => {
    try {
        const newOrder = new orderModel({
            buyerId: req.userInfo.userId,
            itemsList: req.body.itemsList,
            totalPrice: req.body.totalPrice,
            shippingAddress: req.body.shippingAddress,
            orderComment: req.body.orderComment,
            statusHistory: [{ status: 'Pending' }]
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ success: true, order: savedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeOrder = async (req, res) => {
    try {
        const deletedOrder = await orderModel.findByIdAndDelete(req.params.id);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: 'order not found' });
        }

        res.json({ success: true, message: 'order deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const sellerProducts = await getSellerProductIds(req.userInfo.userId);

        const order = await orderModel.findOne({
            _id: req.params.id,
            'itemsList.productId': { $in: sellerProducts }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'order not found' });
        }

        order.status = req.body.status;
        order.statusHistory.push({ status: req.body.status });
        await order.save();

        res.json({ success: true, order: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const sellerProducts = await getSellerProductIds(req.userInfo.userId);

        const order = await orderModel.findOne({
            _id: req.params.id,
            'itemsList.productId': { $in: sellerProducts }
        })
            .populate('buyerId', 'username email phone shippingAddress flagCount')
            .populate('itemsList.productId');

        if (!order) {
            return res.status(404).json({ success: false, message: 'order not found' });
        }

        res.json({ success: true, order: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.traceOrder = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'order not found' });
        }

        res.json({ success: true, status: order.status, history: order.statusHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerOrders = async (req, res) => {
    try {
        const sellerProducts = await getSellerProductIds(req.userInfo.userId);

        const orders = await orderModel.find({
            'itemsList.productId': { $in: sellerProducts }
        })
            .populate('buyerId', 'username email phone shippingAddress flagCount')
            .populate('itemsList.productId')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerOrdersBasedonType = async (req, res) => {
    try {
        const sellerProducts = await getSellerProductIds(req.userInfo.userId);

        const orders = await orderModel.find({
            status: req.params.type,
            'itemsList.productId': { $in: sellerProducts }
        })
            .populate('buyerId', 'username email phone shippingAddress flagCount')
            .populate('itemsList.productId')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
