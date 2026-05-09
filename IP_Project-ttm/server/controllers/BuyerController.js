const userModel = require('../models/usersModel');
const flagModel = require('../models/flagModel');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');

exports.getAllBuyers = async (req, res) => {
    try {
        const buyers = await userModel
            .find({ type:'buyerAccount' })
            .select('email username type isActive shippingAddress flagCount');

        res.json({ success:true, result: buyers });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const buyer = await userModel.findById(req.userInfo.userId);
        res.json({ success:true, buyer: buyer, result: buyer });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.getPurchaseHistroy = async (req, res) => {
    try {
        const buyer = await userModel.findById(req.userInfo.userId);

        if (!buyer || buyer.type !== 'buyerAccount') {
            return res.status(403).json({ success:false, message:'buyer account only' });
        }

        const orders = await orderModel
            .find({ buyerId: req.userInfo.userId })
            .populate('itemsList.productId')
            .sort({ createdAt: -1 });

        res.json({ success:true, orders: orders, result: orders });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.flagSeller = async (req, res) => {
    try {
        const buyer = await userModel.findById(req.userInfo.userId);

        if (!buyer || buyer.type !== 'buyerAccount') {
            return res.status(403).json({ success:false, message:'buyer account only' });
        }

        let sellerId = req.body.sellerId;
        const orderId = req.body.orderId;
        const productId = req.body.productId;

        if (!sellerId && productId) {
            const product = await productModel.findById(productId);

            if (!product) {
                return res.status(404).json({ success:false, message:'product not found' });
            }

            sellerId = product.sellerId;
        }

        if (!sellerId && orderId) {
            const order = await orderModel
                .findById(orderId)
                .populate('itemsList.productId', 'sellerId');

            if (!order) {
                return res.status(404).json({ success:false, message:'order not found' });
            }

            if (!order.buyerId.equals(req.userInfo.userId)) {
                return res.status(403).json({ success:false, message:'you are not the owner of this order' });
            }

            const firstProduct = order.itemsList.find((item) => item.productId && item.productId.sellerId);
            sellerId = firstProduct ? firstProduct.productId.sellerId : null;
        }

        if (!sellerId) {
            return res.status(400).json({ success:false, message:'seller is required' });
        }

        const seller = await userModel.findById(sellerId);

        if (!seller || seller.type !== 'sellerAccount') {
            return res.status(404).json({ success:false, message:'seller not found' });
        }

        const flag = await flagModel.create({
            userId: req.userInfo.userId,
            buyerId: req.userInfo.userId,
            sellerId: sellerId,
            orderId: orderId,
            productId: productId,
            issueScope: 'Seller',
            issueDescription: req.body.details || req.body.reason,
            reason: req.body.reason || 'Seller',
            details: req.body.details
        });

        await userModel.findByIdAndUpdate(sellerId, { $inc: { flagCount: 1 } });

        res.status(201).json({ success:true, message:'seller flagged', flag: flag, result: flag });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};
